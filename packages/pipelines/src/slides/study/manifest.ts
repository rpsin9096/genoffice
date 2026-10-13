/** Parse a study-deck JSON manifest before lint/compile. */
import type { StudyLang, StudyManifest, StudySlide } from './types'

const MODULES = new Set<StudySlide['module']>([
  'title',
  'section_divider',
  'figure',
  'stat_card',
  'checklist',
  'fixed_schema_card',
  'side_by_side',
  'taxonomy_tree',
  'algorithm',
  'synthesis_grid',
  'definition',
  'learning_objectives',
  'timeline',
  'comparison_table',
  'flow_diagram',
  'case_block',
  'glossary',
  'further_reading',
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
  'colloquy',
  'annotated_passage',
])

const LANGS = new Set<StudyLang>(['pt-BR', 'es-ES', 'en-US'])

export type ParseManifestOk = { ok: true; manifest: StudyManifest }
export type ParseManifestErr = {
  ok: false
  error: string
  reason: 'invalid_json' | 'invalid_argument'
}
export type ParseManifestResult = ParseManifestOk | ParseManifestErr

export function parseStudyManifest(raw: string): ParseManifestResult {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'manifest is not valid JSON', reason: 'invalid_json' }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'manifest must be an object', reason: 'invalid_argument' }
  }
  const rec = value as Record<string, unknown>
  const course = rec.course
  if (
    !course ||
    typeof course !== 'object' ||
    Array.isArray(course) ||
    typeof (course as { course?: unknown }).course !== 'string' ||
    !(course as { course: string }).course.trim()
  ) {
    return {
      ok: false,
      error: 'manifest.course.course must be a non-empty string',
      reason: 'invalid_argument',
    }
  }
  if (!Array.isArray(rec.slides) || rec.slides.length === 0) {
    return {
      ok: false,
      error: 'manifest.slides must be a non-empty array',
      reason: 'invalid_argument',
    }
  }
  for (let i = 0; i < rec.slides.length; i++) {
    const slide = rec.slides[i]
    if (!slide || typeof slide !== 'object' || Array.isArray(slide)) {
      return {
        ok: false,
        error: `slides[${i}] must be an object with a module`,
        reason: 'invalid_argument',
      }
    }
    const module = (slide as { module?: unknown }).module
    if (typeof module !== 'string' || !MODULES.has(module as StudySlide['module'])) {
      return {
        ok: false,
        error: `slides[${i}].module ${JSON.stringify(module)} is not a study module`,
        reason: 'invalid_argument',
      }
    }
  }
  if (rec.config !== undefined) {
    if (!rec.config || typeof rec.config !== 'object' || Array.isArray(rec.config)) {
      return { ok: false, error: 'manifest.config must be an object', reason: 'invalid_argument' }
    }
    const lang = (rec.config as { lang?: unknown }).lang
    if (lang !== undefined && (typeof lang !== 'string' || !LANGS.has(lang as StudyLang))) {
      return {
        ok: false,
        error: 'manifest.config.lang must be pt-BR, es-ES or en-US',
        reason: 'invalid_argument',
      }
    }
  }
  return { ok: true, manifest: rec as unknown as StudyManifest }
}
