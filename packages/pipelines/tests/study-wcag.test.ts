import { describe, expect, it } from 'vitest'
import {
  contrastFailures,
  contrastRatio,
  deckContrastFailures,
  failureLines,
  requiredRatio,
} from '../src/slides/study/contrast'
import { compileDeck, compileSlide } from '../src/slides/study/compile'
import { UCP } from '../src/slides/study/palette-ucp'
import { INFLAMACAO_MANIFEST } from './fixtures/inflamacao'
import type { ContrastPair } from '../src/slides/study/painter'
import type { StudySlide } from '../src/slides/study/types'

const BAD: ContrastPair = { fg: '#FFFF00', bg: '#FFFFFF', sizePt: 11, bold: false }
const OK: ContrastPair = { fg: `#${UCP.text}`, bg: `#${UCP.bg}`, sizePt: 11, bold: false }

describe('ContrastGate (3.zip refuse-on-write)', () => {
  it('flags yellow on white below AA body text', () => {
    expect(contrastRatio(BAD.fg, BAD.bg)).toBeLessThan(requiredRatio(BAD.sizePt, BAD.bold))
    const fails = contrastFailures([BAD], { slide: 1, module: 'definition' })
    expect(fails).toHaveLength(1)
    expect(fails[0]).toMatchObject({
      slide: 1,
      module: 'definition',
      required: 4.5,
    })
    expect(fails[0]!.ratio).toBeLessThan(4.5)
  })

  it('accepts UCP body ink on the canvas', () => {
    expect(contrastFailures([OK])).toEqual([])
  })

  it('uses the 3.0 display floor for 18pt, still refusing yellow on white', () => {
    const large = { ...BAD, sizePt: 18 }
    expect(requiredRatio(18, false)).toBe(3)
    expect(contrastFailures([large])).toHaveLength(1)
  })

  it('formats failure lines like 3.zip render.failure_lines', () => {
    const lines = failureLines(contrastFailures([BAD], { slide: 2, module: 'quote_block' }))
    expect(lines[0]).toMatch(
      /^ {2}X slide 2 \[quote_block\]: #FFFF00 sobre #FFFFFF = \d+\.\d+ \(requer 4\.5\)$/,
    )
  })

  it('lets the inflamacao fixture write — zero contrast failures', () => {
    expect(deckContrastFailures(compileDeck(INFLAMACAO_MANIFEST))).toEqual([])
  })

  it('lets a compiled title slide write', () => {
    const { pairs, page } = compileSlide(
      {
        module: 'title',
        title: 'Fisiopatologia da inflamação aguda',
        subtitle: 'Do estímulo lesivo à resolução',
        course: 'Fisiopatologia',
        institution: 'UCP',
      } as StudySlide,
      { course: 'Fisiopatologia', index: 1 },
    )
    expect(contrastFailures(pairs, { slide: 1, module: page.module })).toEqual([])
  })
})
