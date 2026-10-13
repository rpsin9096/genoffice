import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SPEC = resolve(__dirname, '../../../docs/specs/study-port-fork.md')

describe('study-port-fork spec', () => {
  const spec = readFileSync(SPEC, 'utf-8')

  it('is a fork playbook, not a feature pitch', () => {
    expect(spec).toMatch(/fork/i)
    expect(spec).toMatch(/GenOffice/)
    expect(spec).toMatch(/ordem de c[oó]pia|copy order/i)
    expect(spec).toContain('packages/pipelines/src/slides/study/')
    expect(spec).toContain('packages/cli/src/commands/study.ts')
    expect(spec).toContain('skills/genoffice-study/SKILL.md')
    expect(spec).toMatch(/AulaPanel|StudyAulaShell/)
  })

  it('pins landmines that broke this port', () => {
    expect(spec).toMatch(/LAYOUT_VARIANTS/)
    expect(spec).toMatch(/growTextBoxesToContent|n[aã]o crescer/)
    expect(spec).toMatch(/fill-poison/)
    expect(spec).toMatch(/aula\.ts/)
    expect(spec).toMatch(/help-sync/)
    expect(spec).toMatch(/python-pptx/)
    expect(spec).toMatch(/TOOLS\.length|mcp\.test/)
    expect(spec).toMatch(/pdf2docx|PDFium/)
  })

  it('gives a green check on the fork', () => {
    expect(spec).toContain('genoffice study check')
    expect(spec).toContain('genoffice study all')
    expect(spec).toMatch(/35\/35/)
    expect(spec).toMatch(/lint → compile → (create|all)/)
  })
})
