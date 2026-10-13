import { describe, expect, it } from 'vitest'
import { LAYOUT_VARIANTS } from '../src/slides/outline'
import { marketingHits, parseStudyCurve } from '../src/slides/study/curve'
import { WHEN } from '../src/slides/study/when'

const MD = `# OUTLINE — fonte.md

## 1. Inflamação aguda
- Resposta vascular do tecido vivo.
- Neutrófilos nas primeiras 24 h.

## 2. Mediadores
- Histamina abre as junções.
`

describe('study curve (ADR-S5: when, not marketing outline)', () => {
  it('parses outline.md into pedagogical sections', () => {
    const c = parseStudyCurve(MD)
    expect(c.title).toBe('OUTLINE — fonte.md')
    expect(c.sections).toHaveLength(2)
    expect(c.sections[0]!.heading).toBe('1. Inflamação aguda')
    expect(c.sections[0]!.blocks).toEqual([
      'Resposta vascular do tecido vivo.',
      'Neutrófilos nas primeiras 24 h.',
    ])
    expect(c.sections[1]!.heading).toBe('2. Mediadores')
  })

  it('attaches the when catalog so the author matches, the motor does not pick', () => {
    const c = parseStudyCurve(MD)
    expect(c.when).toHaveLength(35)
    expect(c.when.find((w) => w.module === 'definition')?.when).toContain('tese central')
    expect(Object.keys(WHEN)).toHaveLength(35)
  })

  it('does not emit marketing PAGE_TYPES or LAYOUT_VARIANTS', () => {
    const c = parseStudyCurve(MD)
    const blob = JSON.stringify(c)
    expect(blob).not.toMatch(/"type":"cover"/)
    for (const layouts of Object.values(LAYOUT_VARIANTS)) {
      for (const layout of layouts) {
        expect(blob.includes(layout), layout).toBe(false)
      }
    }
  })

  it('flags a marketing deck outline', () => {
    const hits = marketingHits({
      core_hook: 'x',
      pages: [{ title: 'A', type: 'cover', layout: 'cover_typography_hero', brief: 'y' }],
    })
    expect(hits.some((h) => h.includes('cover_typography_hero'))).toBe(true)
    expect(hits.some((h) => h.includes('cover'))).toBe(true)
  })
})
