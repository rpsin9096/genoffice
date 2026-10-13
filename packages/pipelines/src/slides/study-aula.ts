// Browser-safe subpath for the Slides renderer (does not pull in pptx-engine or node:fs).
export {
  aulaBuild,
  aulaSession,
  type AulaBuildResult,
  type AulaSession,
  type AulaSessionInput,
} from './study/aula'
export { acceptFill, fillBrief, fillPoison } from './study/fill'
export { compileDeck, type StudyManifest, type StudyPageSpec, type StudySlide } from './study/compile'
export { lintDeck } from './study/lint'
export { parseStudyManifest } from './study/manifest'
export { describeStudyModule, listStudyModules, skeletonOf } from './study/schema'
