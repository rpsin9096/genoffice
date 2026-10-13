import { describe, expect, it } from 'vitest'
import { ingestOutline, isHeading } from '../src/slides/study/ingest'

describe('study ingest (3.zip ingest.py)', () => {
  it('treats a short numbered title as a heading', () => {
    expect(isHeading('1. Inflamação aguda')).toBe(true)
    expect(isHeading('2.1 Fase vascular')).toBe(true)
    expect(isHeading('3) Cascata celular')).toBe(true)
  })

  it('rejects counts, sentences and long lines', () => {
    expect(isHeading('2.345 pacientes')).toBe(false)
    expect(isHeading('1. O edema segue o gradiente.')).toBe(false)
    expect(isHeading(`1. ${'x'.repeat(80)}`)).toBe(false)
  })

  it('builds outline.md with ## headings and - body blocks', () => {
    const { markdown, blocks } = ingestOutline(
      ['1. Inflamação aguda', '', 'Resposta vascular do tecido vivo.', '2.1 Mediadores', 'Histamina abre junções.'].join(
        '\n',
      ),
      'fonte.md',
    )
    expect(markdown).toContain('# OUTLINE — fonte.md')
    expect(markdown).toContain('## 1. Inflamação aguda')
    expect(markdown).toContain('- Resposta vascular do tecido vivo.')
    expect(markdown).toContain('## 2.1 Mediadores')
    expect(markdown).toContain('- Histamina abre junções.')
    expect(blocks).toBe(2)
  })
})
