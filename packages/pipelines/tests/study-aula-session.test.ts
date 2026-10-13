import { describe, expect, it } from 'vitest'
import { aulaSession } from '../src/slides/study/aula'

const SOURCE = '1. Inflamação aguda\nResposta vascular do tecido vivo.\n'

const CLEAN = JSON.stringify({
  course: { course: 'Fisiopatologia' },
  config: { lang: 'pt-BR' },
  slides: [
    {
      module: 'title',
      title: 'Fisiopatologia da inflamação aguda',
      subtitle: 'Do estímulo lesivo à resolução',
      course: 'Fisiopatologia',
      institution: 'UCP',
    },
  ],
})

const CRUTCH = JSON.stringify({
  course: { course: 'Fisiopatologia' },
  config: { lang: 'pt-BR' },
  slides: [
    {
      module: 'definition',
      title: 'X',
      main_statement: 'É importante destacar que a inflamação é vascular.',
      key_points: [
        { title: 'A', desc: 'um ponto' },
        { title: 'B', desc: 'outro ponto' },
      ],
    },
  ],
})

const MARKETING = JSON.stringify({
  core_hook: 'hook',
  pages: [
    {
      title: 'Cover',
      type: 'cover',
      layout: 'cover_typography_hero',
      brief: 'marketing cover not a study module',
      image_queries: [],
    },
  ],
})

describe('aulaSession (Fase 3 lote: material → curva → lint → build)', () => {
  it('ingests source into a pedagogical curve', () => {
    const s = aulaSession({ sourceText: SOURCE, sourceLabel: 'fonte.md' })
    expect(s.sourceLabel).toBe('fonte.md')
    expect(s.curve.sections[0]!.heading).toContain('Inflamação aguda')
    expect(s.canBuild).toBe(false)
    expect(s.layerB).toEqual([])
  })

  it('blocks build on Layer B crutch', () => {
    const s = aulaSession({ manifestJson: CRUTCH })
    expect(s.canBuild).toBe(false)
    expect(s.layerB.some((r) => r.code === 'STYLE_CRUTCH')).toBe(true)
  })

  it('allows build when the study manifest lints', () => {
    const s = aulaSession({ sourceText: SOURCE, manifestJson: CLEAN })
    expect(s.canBuild).toBe(true)
    expect(s.layerB).toEqual([])
  })

  it('refuses a marketing outline as the manifest', () => {
    const s = aulaSession({ manifestJson: MARKETING })
    expect(s.canBuild).toBe(false)
    expect(s.layerB.some((r) => r.code === 'MARKETING')).toBe(true)
    expect(s.layerB.some((r) => r.message.includes('cover_typography_hero'))).toBe(true)
  })
})
