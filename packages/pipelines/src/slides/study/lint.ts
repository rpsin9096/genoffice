/** Contract + Layer B lint. Empty list means the deck may compile. */
import { lintContract, visitMarker } from './contracts'
import { driftHits } from './i18n'
import { styleHits, type StyleLang } from './style'
import type { StudySlide } from './types'

function walk(value: unknown, loc: string, visit: (text: string, loc: string) => void): void {
  if (typeof value === 'string') visit(value, loc)
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${loc}[${i}]`, visit))
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'image' || k === 'module') continue
      walk(v, `${loc}.${k}`, visit)
    }
  }
}

export function lintDeck(
  slides: readonly StudySlide[],
  lang: StyleLang = 'pt-BR',
  allowTerms: readonly string[] = [],
): string[] {
  const errs: string[] = []
  const allow = allowTerms.map((t) => t.toLowerCase()).filter(Boolean)
  slides.forEach((slide, i) => {
    const loc0 = `slide ${i + 1} [${slide.module}]`
    lintContract(slide, loc0, errs)
    walk(slide, loc0, (text, loc) => {
      visitMarker(text, loc, errs)
      const exempt = allow.some((t) => text.toLowerCase().includes(t))
      if (!exempt) {
        for (const hit of driftHits(text, lang)) {
          errs.push(
            `${loc}: drift ${JSON.stringify(hit.word)} -> ${hit.fix} (reescreva em ${lang})`,
          )
        }
      }
      for (const hit of styleHits(text, lang)) {
        errs.push(`${loc}: estilo [${hit.code}] ${JSON.stringify(hit.term)} — ${hit.hint}`)
      }
    })
  })
  return errs
}
