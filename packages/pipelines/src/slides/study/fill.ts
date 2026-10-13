/** BYOK fill: the LLM writes fields; the motor places x. ADR-S1. */
import { aulaSession, type AulaSession } from './aula'
import { fillPoison } from './fill-poison'
import type { LayerBRow } from './layer-b'

export { fillPoison } from './fill-poison'

export function fillBrief(session: AulaSession): string {
  const sections = session.curve.sections.length
    ? session.curve.sections
        .map((s) => `- ${s.heading}${s.blocks.length ? `: ${s.blocks.join(' ')}` : ''}`)
        .join('\n')
    : '(sem secoes — cole o material)'
  const when = session.curve.when.map((w) => `  ${w.module}: ${w.when}`).join('\n')
  return [
    'Preencha um manifesto study JSON (course, config.lang, slides[]).',
    'Escolha CADA secao por um `when`. O motor NAO coloca x e NAO escolhe COMPACT.',
    'Nao escreva x/y/w/h, hex de cor, nem outline de marketing (cover|content|data).',
    'Redija a ~90% do teto de caracteres; Layer B (sem muleta).',
    '',
    'Secoes:',
    sections,
    '',
    'when:',
    when,
  ].join('\n')
}

export function acceptFill(raw: string): {
  ok: boolean
  poison: string[]
  session: AulaSession
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    const session = aulaSession({ manifestJson: raw })
    return { ok: false, poison: [], session }
  }
  const poison = fillPoison(parsed)
  if (poison.length) {
    const layerB: LayerBRow[] = poison.map((p) => ({
      loc: p,
      kind: 'other',
      code: 'FILL_POISON',
      message: `${p}: o LLM nao coloca x/y/tier`,
    }))
    const session = aulaSession({ manifestJson: raw })
    return {
      ok: false,
      poison,
      session: { ...session, canBuild: false, layerB: [...layerB, ...session.layerB] },
    }
  }
  const session = aulaSession({ manifestJson: raw })
  return { ok: session.canBuild, poison: [], session }
}
