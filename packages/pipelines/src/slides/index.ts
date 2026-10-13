// Renderer code imports './layout-audit' by its own subpath: this entry pulls in pptx-engine (Node only).
export * from './page-spec'
export * from './deck-spec'
export * from './audit-deck'
export * from './layout-audit'
export { coverCropFractions } from './cover-crop'
export { SLIDES_GUIDES } from './guides'
export * from './outline'
export * from './stage-check'
export * from './study/geometry'
export * from './study/contrast'
export * from './study/palette-ucp'
export {
  compileDeck,
  compileDefinition,
  compileSlide,
  type CompileOpts,
  type CompileResult,
  type ContrastPair,
  type DefinitionSlide,
  type KeyPoint,
  type StudyManifest,
  type StudyPageSpec,
  type StudySlide,
} from './study/compile'
export { lintDeck } from './study/lint'
export { parseStudyManifest } from './study/manifest'
export { styleHits } from './study/style'
export { WHEN, whenFor } from './study/when'
export { describeStudyModule, listStudyModules } from './study/schema'
export { deckVisualFailures, visualFailures } from './study/visual'
export { ingestOutline, isHeading } from './study/ingest'
export { overflowsPainted } from './study/fit-drift'
export { allowedPaintHexes, UCP, UCP_TOKENS } from './study/palette-ucp'
export { fixtureSlides, selfTest } from './study/fixtures'
export { inspectFile, prepareImages } from './study/imgprep'
export { GUIDES, isStudyGuide, scaffoldManifest } from './study/scaffold'
export { marketingHits, parseStudyCurve } from './study/curve'
export { layerBVisible } from './study/layer-b'
export { aulaBuild, aulaSession } from './study/aula'
export { acceptFill, fillBrief, fillPoison } from './study/fill'
