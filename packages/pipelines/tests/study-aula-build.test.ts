import { describe, expect, it } from 'vitest'
import { aulaBuild } from '../src/slides/study/aula'

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

describe('aulaBuild (Fase 3: compile only if lint is clean)', () => {
  it('compiles a clean study manifest to page specs', () => {
    const r = aulaBuild({ manifestJson: CLEAN })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.pages).toHaveLength(1)
    expect(r.pages[0]!.layout).toBe('study_title')
    expect(r.pages[0]!.module).toBe('title')
    expect(JSON.stringify(r.pages[0])).toContain('Fisiopatologia da inflamação aguda')
  })

  it('refuses to compile a Layer B hit', () => {
    const r = aulaBuild({ manifestJson: CRUTCH })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.pages).toEqual([])
    expect(r.session.layerB.some((row) => row.code === 'STYLE_CRUTCH')).toBe(true)
  })
})
