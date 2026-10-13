import { describe, expect, it } from 'vitest'
import { aulaSession } from '../src/slides/study/aula'

describe('aulaSession fill guard (poison blocks build)', () => {
  it('blocks build when the fill JSON places x', () => {
    const s = aulaSession({
      manifestJson: JSON.stringify({
        course: { course: 'Fisiopatologia' },
        config: { lang: 'pt-BR' },
        slides: [{ module: 'title', title: 'Inflamação aguda', x: 0.95, y: 1.2 }],
      }),
    })
    expect(s.canBuild).toBe(false)
    expect(s.layerB.some((r) => r.code === 'FILL_POISON')).toBe(true)
  })
})
