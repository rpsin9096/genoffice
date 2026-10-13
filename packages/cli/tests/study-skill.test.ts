import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SKILL = resolve(__dirname, '../../../skills/genoffice-study/SKILL.md')

const MODULES = [
  'title',
  'section_divider',
  'definition',
  'figure',
  'flow_diagram',
  'comparison_table',
  'synthesis_grid',
  'stat_card',
  'checklist',
  'fixed_schema_card',
  'side_by_side',
  'taxonomy_tree',
  'algorithm',
  'case_block',
  'timeline',
  'cycle_diagram',
  'quadrant_matrix',
  'pyramid',
  'venn_diagram',
  'concept_map',
  'chart_data',
  'quote_block',
  'socratic_question',
  'oxford_union',
  'evidence_card',
  'viva_question',
  'mnemonic_card',
  'etymology',
  'references',
  'authority_card',
  'learning_objectives',
  'colloquy',
  'annotated_passage',
  'glossary',
  'further_reading',
]

describe('genoffice-study skill (3.zip SYSTEM_PROMPT)', () => {
  it('exists with a matching skill name and version', () => {
    expect(existsSync(SKILL), SKILL).toBe(true)
    const text = readFileSync(SKILL, 'utf-8')
    expect(text.startsWith('---')).toBe(true)
    expect(text).toMatch(/^---[\s\S]*\nname: genoffice-study\n/)
    expect(text).toMatch(/\n {2}version: 1\.0\.0\n/)
  })

  it('keeps Layer A/B, the 15-40 causal cycle and the expert test', () => {
    const text = readFileSync(SKILL, 'utf-8')
    expect(text).toContain('Layer A')
    expect(text).toContain('Layer B')
    expect(text).toMatch(/15[-–]40/)
    expect(text.toLowerCase()).toContain('teste do especialista')
    expect(text).toContain('STYLE_')
  })

  it('routes fill through genoffice study JSON, never studydeck Python', () => {
    const text = readFileSync(SKILL, 'utf-8')
    expect(text).toContain('genoffice study lint')
    expect(text).toContain('genoffice study compile')
    expect(text).toContain('genoffice study all')
    expect(text).toMatch(/não coloca x|never places x/i)
    expect(text).not.toContain('studydeck all')
    expect(text).not.toContain('COURSE_INFO')
    expect(text).toContain('"slides"')
  })

  it('lists all 35 modules and the when-not-recipe rule', () => {
    const text = readFileSync(SKILL, 'utf-8')
    expect(text).toMatch(/\bwhen\b/i)
    expect(text).toContain('90%')
    expect(text).toContain('WCAG')
    const missing = MODULES.filter((m) => !text.includes(m))
    expect(missing, `skill omits modules: ${missing.join(', ')}`).toEqual([])
    expect(MODULES).toHaveLength(35)
  })
})
