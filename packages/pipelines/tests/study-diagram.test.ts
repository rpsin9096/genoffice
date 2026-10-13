import { describe, expect, it } from 'vitest'
import { compileSlide } from '../src/slides/study/compile'
import { lintDeck } from '../src/slides/study/lint'
import { parseStudyManifest } from '../src/slides/study/manifest'
import type { StudySlide } from '../src/slides/study/types'

const opts = { course: 'Fisiopatologia', index: 9 }

const CYCLE = {
  module: 'cycle_diagram' as const,
  title: 'Ciclo vascular',
  center_label: 'Foco',
  nodes: [
    { title: 'Estímulo', desc: 'Lesão tecidual inicial.' },
    { title: 'Exsudato', desc: 'Permeabilidade elevada.', highlight: true },
    { title: 'Resolução', desc: 'Retorno ao basal.' },
  ],
}

const QUAD = {
  module: 'quadrant_matrix' as const,
  title: 'Matriz 2x2',
  x_label: 'Tempo',
  y_label: 'Células',
  quadrants: [
    { title: 'Aguda local', points: ['Neutrófilos', 'Horas'] },
    { title: 'Aguda sistêmica', points: ['Febre', 'Leucocitose'] },
    { title: 'Crônica local', points: ['Macrófagos', 'Fibrose'] },
    { title: 'Crônica sistêmica', points: ['Linfócitos', 'Anos'] },
  ],
}

const PYRAMID = {
  module: 'pyramid' as const,
  title: 'Hierarquia',
  levels: [
    { title: 'Tecido', desc: 'Base' },
    { title: 'Vasos', desc: 'Meio' },
    { title: 'Mediadores', desc: 'Topo', highlight: true },
  ],
}

const VENN = {
  module: 'venn_diagram' as const,
  title: 'Sobreposição',
  sets: [
    { label: 'Vascular', items: ['Rubor', 'Calor'] },
    { label: 'Celular', items: ['Diapedese', 'Quimiocinese'] },
  ],
  shared: ['Foco lesional'],
}

const MAP = {
  module: 'concept_map' as const,
  title: 'Mapa',
  hub: 'Inflamação',
  nodes: [
    { title: 'Vasos', desc: 'Calibre e permeabilidade.' },
    { title: 'Células', desc: 'Neutrófilos e monócitos.' },
    { title: 'Mediadores', desc: 'Histamina e PG.' },
    { title: 'Desfecho', desc: 'Resolução ou fibrose.' },
  ],
}

const CHART = {
  module: 'chart_data' as const,
  title: 'Influxo',
  chart_type: 'bar',
  categories: ['6 h', '24 h', '72 h'],
  series: [{ name: 'Neutrófilos', values: [20, 80, 30] }],
  insights: [
    'O pico ocorre às 24 horas do estímulo.',
    'A queda às 72 horas marca a troca celular.',
  ],
  credit: 'Robbins 10ed',
}

const ALL = [CYCLE, QUAD, PYRAMID, VENN, MAP, CHART]

describe('diagram module batch (3.zip)', () => {
  it('compiles cycle_diagram nodes around a hub', () => {
    const { page } = compileSlide(CYCLE as StudySlide, opts)
    expect(page.layout).toBe('study_cycle_diagram')
    expect(JSON.stringify(page)).toContain('Exsudato')
    expect(JSON.stringify(page)).toContain('Foco')
  })

  it('compiles quadrant_matrix with four titles', () => {
    const { page } = compileSlide(QUAD as StudySlide, opts)
    expect(page.layout).toBe('study_quadrant_matrix')
    expect(JSON.stringify(page)).toContain('Aguda local')
    expect(JSON.stringify(page)).toContain('TEMPO')
  })

  it('compiles pyramid base-to-apex levels', () => {
    const { page } = compileSlide(PYRAMID as StudySlide, opts)
    expect(page.layout).toBe('study_pyramid')
    expect(JSON.stringify(page)).toContain('Mediadores')
  })

  it('compiles venn_diagram sets without downloading anything', () => {
    const { page } = compileSlide(VENN as StudySlide, opts)
    expect(page.layout).toBe('study_venn_diagram')
    expect(JSON.stringify(page)).toContain('VASCULAR')
    expect(JSON.stringify(page)).toContain('Foco lesional')
  })

  it('compiles concept_map hub and satellites', () => {
    const { page } = compileSlide(MAP as StudySlide, opts)
    expect(page.layout).toBe('study_concept_map')
    expect(JSON.stringify(page)).toContain('Inflamação')
    expect(JSON.stringify(page)).toContain('Histamina')
  })

  it('compiles chart_data as bars plus a reading panel', () => {
    const { page } = compileSlide(CHART as StudySlide, opts)
    expect(page.layout).toBe('study_chart_data')
    expect(JSON.stringify(page)).toContain('24 h')
    expect(JSON.stringify(page)).toContain('LEITURA')
  })

  it('lints the six fixtures clean and rejects a short cycle', () => {
    expect(lintDeck(ALL as StudySlide[])).toEqual([])
    expect(
      lintDeck([
        { module: 'cycle_diagram', title: 'X', nodes: [{ title: 'A' }, { title: 'B' }] } as StudySlide,
      ]).some((e) => e.includes('.nodes') && e.includes('esperado 3-6')),
    ).toBe(true)
  })

  it('parses all six in a study manifest', () => {
    const r = parseStudyManifest(
      JSON.stringify({ course: { course: 'Fisiopatologia' }, slides: ALL }),
    )
    expect(r.ok).toBe(true)
  })
})
