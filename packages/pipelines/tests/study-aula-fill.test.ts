import { describe, expect, it } from 'vitest'
import { aulaSession } from '../src/slides/study/aula'
import { acceptFill, fillBrief, fillPoison } from '../src/slides/study/fill'

const SOURCE = '1. Inflamação aguda\nResposta vascular do tecido vivo.\n'

const CLEAN = {
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
}

describe('aula fill (BYOK: LLM fills fields, motor places x)', () => {
  it('writes a brief that lists sections and forbids x/tier/hex', () => {
    const session = aulaSession({ sourceText: SOURCE, sourceLabel: 'fonte.md' })
    const brief = fillBrief(session)
    expect(brief).toContain('Inflamação aguda')
    expect(brief).toContain('tese central')
    expect(brief.toLowerCase()).toMatch(/n[aã]o coloca x/)
    expect(brief).toMatch(/COMPACT/)
    expect(brief.toLowerCase()).toMatch(/hex/)
  })

  it('accepts a study manifest without coordinates', () => {
    const r = acceptFill(JSON.stringify(CLEAN))
    expect(r.ok).toBe(true)
    expect(r.poison).toEqual([])
  })

  it('refuses fill JSON that places x/y or picks a tier', () => {
    const poison = fillPoison({
      course: { course: 'X' },
      slides: [{ module: 'title', title: 'T', x: 0.95, y: 1.2, tier: 'COMPACT' }],
    })
    expect(poison.some((p) => p.includes('.x'))).toBe(true)
    expect(poison.some((p) => p.includes('.tier'))).toBe(true)
    const r = acceptFill(
      JSON.stringify({
        course: { course: 'X' },
        slides: [{ module: 'title', title: 'T', x: 12 }],
      }),
    )
    expect(r.ok).toBe(false)
    expect(r.session.layerB.some((row) => row.code === 'FILL_POISON')).toBe(true)
  })
})
