import { describe, expect, it } from 'vitest'
import { WHEN, whenFor } from '../src/slides/study/when'
import type { StudySlide } from '../src/slides/study/types'

const MODULES: StudySlide['module'][] = [
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

describe('study when catalog (3.zip registry.WHEN)', () => {
  it('covers all 35 modules with a non-empty when', () => {
    expect(MODULES).toHaveLength(35)
    expect(Object.keys(WHEN).sort()).toEqual([...MODULES].sort())
    for (const name of MODULES) {
      expect(WHEN[name].trim().length, name).toBeGreaterThan(10)
    }
  })

  it('keeps the 3.zip wording for core and scholarly picks', () => {
    expect(whenFor('title')).toBe('toda apresentacao: capa com curso, titulo e subtitulo')
    expect(whenFor('definition')).toContain('tese central')
    expect(whenFor('flow_diagram')).toContain('3-4 passos')
    expect(whenFor('etymology')).toContain('raizes')
    expect(whenFor('colloquy')).toContain('tutor/estudante')
  })

  it('never frames a module as a closed recipe', () => {
    for (const name of MODULES) {
      expect(WHEN[name].toLowerCase()).not.toMatch(/sempre use|receita fechada/)
    }
  })
})
