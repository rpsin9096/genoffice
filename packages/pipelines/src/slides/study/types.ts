export interface KeyPoint {
  title: string
  desc: string
}

export interface NarrativeBlock {
  title: string
  desc: string
}

export interface CheckItem {
  label: string
  desc?: string
  checked?: boolean
}

export interface ChecklistSlide {
  module: 'checklist'
  kicker?: string
  title: string
  items: CheckItem[]
  image?: string
  caption?: string
  credit?: string
  footnote?: string
}

export interface SchemaField {
  label: string
  value: string
}

export interface FixedSchemaSlide {
  module: 'fixed_schema_card'
  kicker?: string
  title: string
  fields: SchemaField[]
  footnote?: string
}

export interface SideCard {
  header?: string
  title?: string
  points?: string[]
}

export interface SideBySideSlide {
  module: 'side_by_side'
  kicker?: string
  title: string
  left_card: SideCard
  right_card: SideCard
  footnote?: string
}

export interface TaxonomyCategory {
  name: string
  property?: string
  examples?: string[]
}

export interface TaxonomyTreeSlide {
  module: 'taxonomy_tree'
  kicker?: string
  title: string
  root: string
  categories: TaxonomyCategory[]
  footnote?: string
}

export interface AlgorithmStep {
  label?: string
  title: string
  desc?: string
  highlight?: boolean
}

export interface AlgorithmSlide {
  module: 'algorithm'
  kicker?: string
  title: string
  steps: AlgorithmStep[]
  footnote?: string
}

export interface SynthesisGridSlide {
  module: 'synthesis_grid'
  kicker?: string
  title: string
  headers: string[]
  matrix_data: string[][]
  col_widths?: number[]
  takeaway?: string
  footnote?: string
}

export interface StatCardSlide {
  module: 'stat_card'
  kicker?: string
  title: string
  stat_num: string
  stat_title: string
  narrative_blocks?: NarrativeBlock[]
  image?: string
  caption?: string
  credit?: string
  footnote?: string
}

export interface FigureSlide {
  module: 'figure'
  kicker?: string
  title: string
  image: string
  caption: string
  credit: string
  footnote?: string
}

export interface TitleSlide {
  module: 'title'
  title: string
  subtitle?: string
  course?: string
  institution?: string
  author?: string
}

export interface SectionDividerSlide {
  module: 'section_divider'
  section_title: string
  section_subtitle?: string
}

export interface DefinitionSlide {
  module: 'definition'
  kicker?: string
  title: string
  main_statement: string
  elaboration?: string
  key_points?: KeyPoint[]
  footnote?: string
}

export interface Objective {
  verb: string
  text: string
  bloom?: string
}

export interface LearningObjectivesSlide {
  module: 'learning_objectives'
  kicker?: string
  title: string
  objectives: Objective[]
}

export interface Milestone {
  label: string
  title: string
  desc?: string
}

export interface TimelineSlide {
  module: 'timeline'
  kicker?: string
  title: string
  milestones: Milestone[]
}

export interface ComparisonTableSlide {
  module: 'comparison_table'
  kicker?: string
  title: string
  headers: string[]
  rows: string[][]
  col_widths?: number[]
  takeaway?: string
}

export interface FlowStep {
  label?: string
  title: string
  desc: string
  highlight?: boolean
  decision?: boolean
}

export interface FlowDiagramSlide {
  module: 'flow_diagram'
  kicker?: string
  title: string
  steps: FlowStep[]
  explanation?: string
}

export interface CaseBlockSlide {
  module: 'case_block'
  kicker?: string
  title: string
  case_stem: string
  findings: string[]
  reasoning: string
  diagnosis: string
  clinical_pearl: string
}

export interface GlossaryTerm {
  term: string
  def: string
}

export interface GlossarySlide {
  module: 'glossary'
  kicker?: string
  title: string
  terms: GlossaryTerm[]
}

export interface ReadingEntry {
  tag: string
  title: string
  note?: string
}

export interface FurtherReadingSlide {
  module: 'further_reading'
  kicker?: string
  title: string
  entries: ReadingEntry[]
}

export interface CycleNode {
  title: string
  desc?: string
  highlight?: boolean
}

export interface CycleDiagramSlide {
  module: 'cycle_diagram'
  kicker?: string
  title: string
  center_label?: string
  nodes: CycleNode[]
  footnote?: string
}

export interface Quadrant {
  title: string
  points: string[]
}

export interface QuadrantMatrixSlide {
  module: 'quadrant_matrix'
  kicker?: string
  title: string
  x_label?: string
  y_label?: string
  quadrants: Quadrant[]
  footnote?: string
}

export interface PyramidLevel {
  title: string
  desc?: string
  highlight?: boolean
}

export interface PyramidSlide {
  module: 'pyramid'
  kicker?: string
  title: string
  levels: PyramidLevel[]
  footnote?: string
}

export interface VennSet {
  label: string
  items: string[]
}

export interface VennDiagramSlide {
  module: 'venn_diagram'
  kicker?: string
  title: string
  sets: VennSet[]
  shared: string[]
  footnote?: string
}

export interface ConceptNode {
  title: string
  desc?: string
  highlight?: boolean
}

export interface ConceptMapSlide {
  module: 'concept_map'
  kicker?: string
  title: string
  hub: string
  nodes: ConceptNode[]
  footnote?: string
}

export interface ChartSeries {
  name: string
  values: number[]
}

export interface ChartDataSlide {
  module: 'chart_data'
  kicker?: string
  title: string
  chart_type?: 'bar' | 'line'
  categories: string[]
  series: ChartSeries[]
  insights: string[]
  credit?: string
  footnote?: string
}

export interface QuoteBlockSlide {
  module: 'quote_block'
  kicker?: string
  title: string
  quote: string
  author: string
  source?: string
  year?: string
  context?: string
  footnote?: string
}

export interface SocraticQuestionSlide {
  module: 'socratic_question'
  kicker?: string
  title: string
  question: string
  context?: string
  scaffold: string[]
  reading?: string
  footnote?: string
}

export interface DebateCard {
  title?: string
  points?: string[]
}

export interface OxfordUnionSlide {
  module: 'oxford_union'
  kicker?: string
  title: string
  motion: string
  pro_card: DebateCard
  con_card: DebateCard
  verdict: string
  footnote?: string
}

export interface EvidenceCardSlide {
  module: 'evidence_card'
  kicker?: string
  title: string
  study_name: string
  design: string
  year?: string
  population: string
  intervention: string
  comparison?: string
  outcome: string
  effect: string
  effect_desc?: string
  limitation?: string
  credit: string
  footnote?: string
}

export interface VivaQuestionSlide {
  module: 'viva_question'
  kicker?: string
  title: string
  prompt: string
  model_answer: string
  examiner_note: string
  difficulty?: string
  footnote?: string
}

export interface MnemonicCardSlide {
  module: 'mnemonic_card'
  kicker?: string
  title: string
  acronym: string
  expansion: string[]
  usage: string
  domain?: string
  footnote?: string
}

export interface EtymologyRoot {
  part: string
  origin?: string
  meaning?: string
}

export interface EtymologySlide {
  module: 'etymology'
  kicker?: string
  title: string
  term: string
  fragments?: string[]
  roots: EtymologyRoot[]
  modern: string
  footnote?: string
}

export interface ReferencesSlide {
  module: 'references'
  kicker?: string
  title: string
  refs: string[]
  footnote?: string
}

export interface AuthorityCardSlide {
  module: 'authority_card'
  kicker?: string
  title: string
  image: string
  name: string
  dates?: string
  epithet?: string
  bio: string
  legacy?: string
  caption?: string
  credit?: string
  footnote?: string
}

export interface ColloquyTurn {
  speaker: 'tutor' | 'student'
  text: string
}

export interface ColloquySlide {
  module: 'colloquy'
  kicker?: string
  title: string
  turns: ColloquyTurn[]
  footnote?: string
}

export interface PassageNote {
  ref: string
  note: string
}

export interface AnnotatedPassageSlide {
  module: 'annotated_passage'
  kicker?: string
  title: string
  passage: string
  source?: string
  annotations: PassageNote[]
  footnote?: string
}

export type StudySlide =
  | TitleSlide
  | SectionDividerSlide
  | FigureSlide
  | StatCardSlide
  | ChecklistSlide
  | FixedSchemaSlide
  | SideBySideSlide
  | TaxonomyTreeSlide
  | AlgorithmSlide
  | SynthesisGridSlide
  | DefinitionSlide
  | LearningObjectivesSlide
  | TimelineSlide
  | ComparisonTableSlide
  | FlowDiagramSlide
  | CaseBlockSlide
  | GlossarySlide
  | FurtherReadingSlide
  | CycleDiagramSlide
  | QuadrantMatrixSlide
  | PyramidSlide
  | VennDiagramSlide
  | ConceptMapSlide
  | ChartDataSlide
  | QuoteBlockSlide
  | SocraticQuestionSlide
  | OxfordUnionSlide
  | EvidenceCardSlide
  | VivaQuestionSlide
  | MnemonicCardSlide
  | EtymologySlide
  | ReferencesSlide
  | AuthorityCardSlide
  | ColloquySlide
  | AnnotatedPassageSlide

export type StudyLang = 'pt-BR' | 'es-ES' | 'en-US'

export interface StudyManifest {
  course: { course: string; institution?: string; author?: string }
  config?: { lang?: StudyLang }
  slides: StudySlide[]
}
