/**
 * StudyDeck module dict → GenOffice page-spec.
 * The LLM fills fields; paintModule places x/y. Density is STANDARD or COMPACT.
 */
import type { Tier } from './geometry'
import { STANDARD } from './geometry'
import { setUi } from './i18n'
import { paintModule, titleOf } from './modules'
import { Painter, type ContrastPair, type SpecElement } from './painter'
import type { DefinitionSlide, StudyLang, StudyManifest, StudySlide } from './types'

export type { ContrastPair, SpecElement }
export type { DefinitionSlide, KeyPoint, StudyLang, StudyManifest, StudySlide } from './types'

export interface CompileOpts {
  course: string
  index: number
  lang?: StudyLang
}

export interface StudyPageSpec {
  background: string
  title: string
  type: 'cover' | 'content'
  layout: string
  module: StudySlide['module']
  tier: Tier['name']
  elements: SpecElement[]
}

export interface CompileResult {
  page: StudyPageSpec
  tier: Tier
  pairs: ContrastPair[]
}

const NO_CHROME: ReadonlySet<string> = new Set(['title', 'section_divider'])

export function compileSlide(slide: StudySlide, opts: CompileOpts): CompileResult {
  setUi(opts.lang ?? 'pt-BR')
  const p = new Painter()
  const tier = paintModule(p, slide, opts.course, opts.index) ?? STANDARD
  const cover = NO_CHROME.has(slide.module)
  return {
    tier,
    pairs: p.pairs,
    page: {
      background: p.background(
        cover && slide.module === 'title' ? 'primary' : cover ? 'primary' : 'bg',
      ),
      title: titleOf(slide),
      type: slide.module === 'title' ? 'cover' : 'content',
      layout: `study_${slide.module}`,
      module: slide.module,
      tier: tier.name,
      elements: p.elements,
    },
  }
}

export function compileDefinition(slide: DefinitionSlide, opts: CompileOpts): CompileResult {
  return compileSlide(slide, opts)
}

export function compileDeck(manifest: StudyManifest): CompileResult[] {
  const course = manifest.course.course
  const lang = manifest.config?.lang ?? 'pt-BR'
  return manifest.slides.map((slide, i) => compileSlide(slide, { course, index: i + 1, lang }))
}
