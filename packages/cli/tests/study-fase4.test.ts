import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SKILL = resolve(__dirname, '../../../skills/genoffice-study/SKILL.md')
const SPEC = resolve(__dirname, '../../../docs/specs/study-deck-pipeline.md')

describe('Fase 4 — GenOffice is the runtime', () => {
  it('routes OpenCode through lint → compile → all, not python-pptx', () => {
    const skill = readFileSync(SKILL, 'utf-8')
    expect(skill).toContain('genoffice study lint')
    expect(skill).toContain('genoffice study compile')
    expect(skill).toContain('genoffice study all')
    expect(skill).toMatch(/python-pptx/)
    expect(skill.toLowerCase()).toMatch(/n[aã]o (é|e) o runtime|not the runtime|n[aã]o escreve/)
    expect(skill).not.toMatch(/rode `studydeck/)
  })

  it('records Fase 4 as GenOffice runtime, 3.zip as contracts only', () => {
    const spec = readFileSync(SPEC, 'utf-8')
    expect(spec).toMatch(/Fase 4/)
    expect(spec).toMatch(/runtime/)
    expect(spec.toLowerCase()).toMatch(/refer[eê]ncia de contratos/)
    expect(spec).toMatch(/lint → compile → (create|all)/)
  })
})
