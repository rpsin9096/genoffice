/** Self-test fixture: one valid slide per module (3.zip fixtures.py). */
import { compileDeck, type CompileResult } from './compile'
import { deckContrastFailures, type ContrastFail } from './contrast'
import { WHEN } from './when'
import type { StudySlide } from './types'

const IMG = 'placeholder:fixture'

export function fixtureSlides(): StudySlide[] {
  const S: StudySlide[] = [
    { module: 'title', course: 'check', title: 'dry-run', subtitle: '', institution: '' },
    { module: 'section_divider', section_title: 'Secção um' },
    {
      module: 'definition',
      kicker: 'k',
      title: 't',
      main_statement: 'Enunciado central de prova do motor.',
      key_points: [
        { title: 'a', desc: 'desc a' },
        { title: 'b', desc: 'desc b' },
      ],
    },
    {
      module: 'flow_diagram',
      kicker: 'k',
      title: 't',
      steps: [
        { label: '1', title: 'fase 1', desc: 'desc a' },
        { label: '2', title: 'fase 2', desc: 'desc b', highlight: true },
        { label: '3', title: 'fase 3', desc: 'desc c' },
      ],
    },
    {
      module: 'comparison_table',
      kicker: 'k',
      title: 't',
      headers: ['a', 'b', 'c'],
      rows: [
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
      ],
      col_widths: [1, 2, 3],
    },
    {
      module: 'synthesis_grid',
      kicker: 'k',
      title: 't',
      headers: ['a', 'b', 'c'],
      matrix_data: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
    },
    {
      module: 'stat_card',
      kicker: 'k',
      title: 't',
      stat_num: '42%',
      stat_title: 'Resultado principal do estudo de prova',
      narrative_blocks: [
        { title: 'b1', desc: 'd1' },
        { title: 'b2', desc: 'd2' },
      ],
    },
    {
      module: 'checklist',
      kicker: 'k',
      title: 't',
      items: [
        { label: 'passo um' },
        { label: 'passo dois', checked: false },
        { label: 'passo tres' },
      ],
    },
    {
      module: 'fixed_schema_card',
      kicker: 'k',
      title: 't',
      fields: [
        { label: 'campo', value: 'valor' },
        { label: 'outro', value: 'dado' },
      ],
    },
    {
      module: 'side_by_side',
      kicker: 'k',
      title: 't',
      left_card: { header: 'A', title: 'lado A', points: ['p1', 'p2', 'p3'] },
      right_card: { header: 'B', title: 'lado B', points: ['q1', 'q2', 'q3'] },
    },
    {
      module: 'taxonomy_tree',
      kicker: 'k',
      title: 't',
      root: 'raiz',
      categories: [
        { name: 'cat1', property: 'prop', examples: ['e1'] },
        { name: 'cat2', property: 'prop', examples: ['e2'] },
      ],
    },
    {
      module: 'algorithm',
      kicker: 'k',
      title: 't',
      steps: [{ title: 'passo 1' }, { title: 'passo 2', highlight: true }, { title: 'passo 3' }],
    },
    {
      module: 'case_block',
      kicker: 'k',
      title: 't',
      case_stem: 'Paciente de prova com dados suficientes para o caso.',
      findings: ['achado um', 'achado dois'],
      reasoning: 'Raciocinio diagnostico de prova do modulo.',
      diagnosis: 'Diagnostico',
      clinical_pearl: 'Perola de prova do modulo.',
    },
    {
      module: 'timeline',
      kicker: 'k',
      title: 't',
      milestones: Array.from({ length: 5 }, (_, i) => ({
        label: String(i + 1),
        title: `Marco ${i + 1}`,
        desc: 'desc',
      })),
    },
    {
      module: 'cycle_diagram',
      kicker: 'k',
      title: 't',
      center_label: 'ciclo',
      nodes: Array.from({ length: 4 }, (_, i) => ({ title: `n${i + 1}` })),
    },
    {
      module: 'quadrant_matrix',
      kicker: 'k',
      title: 't',
      x_label: 'eixo x',
      y_label: 'eixo y',
      quadrants: Array.from({ length: 4 }, (_, i) => ({
        title: `q${i + 1}`,
        points: ['p1', 'p2'],
      })),
    },
    {
      module: 'pyramid',
      kicker: 'k',
      title: 't',
      levels: Array.from({ length: 3 }, (_, i) => ({ title: `nivel ${i + 1}` })),
    },
    { module: 'quote_block', kicker: 'k', title: 't', quote: 'Cita de prova do motor.', author: 'Autor' },
    {
      module: 'socratic_question',
      kicker: 'k',
      title: 't',
      question: 'Pergunta tutorial de prova?',
      scaffold: ['raciocinio um', 'raciocinio dois'],
    },
    {
      module: 'oxford_union',
      kicker: 'k',
      title: 't',
      motion: 'mocao de prova',
      pro_card: { title: 'pro', points: ['p1', 'p2'] },
      con_card: { title: 'con', points: ['c1', 'c2'] },
      verdict: 'veredicto de prova',
    },
    {
      module: 'evidence_card',
      kicker: 'k',
      title: 't',
      study_name: 'Estudo Prova',
      design: 'rct',
      population: 'pacientes adultos',
      intervention: 'farmaco X',
      comparison: 'placebo',
      outcome: 'evento Y',
      effect: 'HR 0.75',
      credit: 'Revista 2024',
    },
    {
      module: 'viva_question',
      kicker: 'k',
      title: 't',
      prompt: 'Pergunta de viva voce de prova.',
      model_answer: 'Resposta modelo de prova.',
      examiner_note: 'Nota do examinador de prova.',
    },
    {
      module: 'mnemonic_card',
      kicker: 'k',
      title: 't',
      acronym: 'ABC',
      expansion: ['alfa', 'beta', 'gamma'],
      usage: 'Uso clinico da regra mnemotecnica de prova.',
    },
    {
      module: 'etymology',
      kicker: 'k',
      title: 't',
      term: 'Apendicite',
      fragments: ['Apendic', 'ite'],
      roots: [
        { part: 'Apendic', origin: 'latin', meaning: 'apendice' },
        { part: 'ite', origin: 'greek', meaning: 'inflamacao' },
      ],
      modern: 'Inflamacao do apendice.',
    },
    {
      module: 'venn_diagram',
      kicker: 'k',
      title: 't',
      sets: [
        { label: 'A', items: ['a1', 'a2'] },
        { label: 'B', items: ['b1', 'b2'] },
        { label: 'C', items: ['c1', 'c2'] },
      ],
      shared: ['comum'],
    },
    {
      module: 'chart_data',
      kicker: 'k',
      title: 't',
      chart_type: 'bar',
      categories: ['c1', 'c2'],
      series: [{ name: 's1', values: [1, 2] }],
      insights: ['leitura de prova um', 'leitura de prova dois'],
    },
    {
      module: 'references',
      kicker: 'k',
      title: 't',
      refs: [
        'Autor A. Titulo de prova. 2024.',
        'Autor B. Outro titulo. 2023.',
        'Autor C. Referencia extra. 2022.',
      ],
    },
    {
      module: 'learning_objectives',
      kicker: 'k',
      title: 't',
      objectives: [
        { verb: 'Explicar', text: 'a fisiopatologia da fase aguda e seu manejo', bloom: 'understand' },
        { verb: 'Aplicar', text: 'o algoritmo de decisao em cada caso', bloom: 'apply' },
        { verb: 'Analisar', text: 'os achados dos estudos citados', bloom: 'analyze' },
      ],
    },
    {
      module: 'colloquy',
      kicker: 'k',
      title: 't',
      turns: [
        { speaker: 'tutor', text: 'turno do tutor de prova' },
        { speaker: 'student', text: 'resposta do estudante' },
        { speaker: 'tutor', text: 'replica do tutor' },
        { speaker: 'student', text: 'contraresposta' },
      ],
    },
    {
      module: 'annotated_passage',
      kicker: 'k',
      title: 't',
      passage: 'Fragmento de fonte primaria [1] com nota a margem [2].',
      source: 'Fonte, 1900',
      annotations: [
        { ref: '1', note: 'nota um' },
        { ref: '2', note: 'nota dois' },
      ],
    },
    {
      module: 'concept_map',
      kicker: 'k',
      title: 't',
      hub: 'conceito',
      nodes: Array.from({ length: 4 }, (_, i) => ({ title: `satelite ${i + 1}` })),
    },
    {
      module: 'glossary',
      kicker: 'k',
      title: 't',
      terms: [
        { term: 'Fase aguda', def: 'Periodo inicial de maior risco e demanda' },
        { term: 'Algoritmo', def: 'Sequencia de passos com decisao' },
        { term: 'Caso indice', def: 'Primeiro caso que motiva o estudo' },
        { term: 'Perola clinica', def: 'Conselho de alto rendimento' },
      ],
    },
    {
      module: 'further_reading',
      kicker: 'k',
      title: 't',
      entries: [
        { tag: 'essencial', title: 'Leitura basica', note: 'nota' },
        { tag: 'avancado', title: 'Leitura avancada', note: 'nota' },
        { tag: 'complementario', title: 'Leitura media', note: 'nota' },
      ],
    },
    {
      module: 'figure',
      kicker: 'k',
      title: 't',
      image: IMG,
      caption: 'Microfotografia de prova do fixture do motor.',
      credit: 'Motor 2026',
    },
    {
      module: 'authority_card',
      kicker: 'k',
      title: 't',
      image: IMG,
      caption: 'Retrato institucional de prova do fixture.',
      credit: 'Motor 2026',
      name: 'Autor de Prova',
      bio: 'Biografia breve de prova do fixture.',
      legacy: 'Legado de prova',
    },
  ]
  const present = new Set(S.map((s) => s.module))
  const missing = (Object.keys(WHEN) as StudySlide['module'][]).filter((m) => !present.has(m))
  if (missing.length) {
    throw new Error(`fixture self-test incompleto, faltam: ${missing.sort().join(', ')}`)
  }
  return S
}

export interface SelfTestRow {
  module: string
  ok: boolean
  detail: string
}

export function selfTest(): {
  rows: SelfTestRow[]
  compiled: CompileResult[]
  fails: ContrastFail[]
} {
  const slides = fixtureSlides()
  const compiled = compileDeck({
    course: { course: 'STUDYDECK CHECK' },
    config: { lang: 'pt-BR' },
    slides,
  })
  const fails = deckContrastFailures(compiled)
  const byMod = new Map<string, ContrastFail[]>()
  for (const f of fails) {
    const list = byMod.get(f.module) ?? []
    list.push(f)
    byMod.set(f.module, list)
  }
  const rows = compiled.map((r) => {
    const hit = byMod.get(r.page.module) ?? []
    return {
      module: r.page.module,
      ok: hit.length === 0,
      detail: hit.length ? `${hit[0]!.fg}/${hit[0]!.bg}` : '',
    }
  })
  return { rows, compiled, fails }
}
