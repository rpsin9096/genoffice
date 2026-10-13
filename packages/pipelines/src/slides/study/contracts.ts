/** B budgets, REQUIRED_NONEMPTY, cardinality and FIT_RULES from study-deck 3.zip. */
import { ELABORATION_H, estHeight } from './geometry'
import type { StudySlide } from './types'

export const FIT_TOLERANCE = 1.06

const MARKER = /^<=\s*\d+\s*car\.\s*>$/
const BLOOM = new Set(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'])
export const NO_HEADER = new Set<StudySlide['module']>(['title', 'section_divider'])
export const COMMON: Record<string, number> = { kicker: 55, title: 75, footnote: 140 }

type Rec = Record<string, unknown>

export const REQUIRED: Record<StudySlide['module'], readonly string[]> = {
  title: ['title'],
  section_divider: ['section_title'],
  figure: ['image', 'caption', 'credit'],
  stat_card: ['stat_num', 'stat_title'],
  checklist: [],
  fixed_schema_card: [],
  side_by_side: [],
  taxonomy_tree: ['root'],
  algorithm: [],
  synthesis_grid: ['headers'],
  definition: ['main_statement'],
  flow_diagram: [],
  comparison_table: ['headers'],
  case_block: ['case_stem', 'reasoning', 'diagnosis', 'clinical_pearl'],
  timeline: [],
  learning_objectives: [],
  glossary: [],
  further_reading: [],
  cycle_diagram: [],
  quadrant_matrix: [],
  pyramid: [],
  venn_diagram: [],
  chart_data: [],
  concept_map: ['hub'],
  quote_block: ['quote', 'author'],
  socratic_question: ['question'],
  oxford_union: ['motion', 'verdict'],
  evidence_card: ['study_name', 'design', 'population', 'intervention', 'outcome', 'effect', 'credit'],
  viva_question: ['prompt', 'model_answer', 'examiner_note'],
  mnemonic_card: ['acronym', 'usage'],
  etymology: ['term', 'modern'],
  references: [],
  authority_card: ['image', 'name', 'bio'],
  colloquy: [],
  annotated_passage: ['passage'],
}

/** Per-module character budgets and structural rules (3.zip `B`). */
const B: Record<StudySlide['module'], Rec> = {
  title: { title: 80, subtitle: 100, course: 70, institution: 70, author: 70 },
  section_divider: { section_title: 70, section_subtitle: 180, divider_style: 40, author: 70 },
  figure: { caption: 110, credit: 130 },
  stat_card: {
    stat_num: 10,
    stat_title: 120,
    caption: 110,
    credit: 130,
    _list: ['narrative_blocks', 1, 3, { title: 45, desc: 180 }],
  },
  checklist: {
    caption: 110,
    credit: 130,
    _list: ['items', 2, 5, { label: 65, desc: 150 }],
  },
  fixed_schema_card: { _list: ['fields', 2, 5, { label: 30, value: 170 }] },
  side_by_side: { _cards: [{ header: 35, title: 50 }, 3, 4, 125] },
  taxonomy_tree: {
    root: 50,
    _list: ['categories', 2, 3, { name: 30, property: 65 }],
    _examples: [3, 90],
  },
  algorithm: {
    _list: ['steps', 2, 4, { title: 70, desc: 200 }],
    _highlight: ['steps', 0, 1],
  },
  synthesis_grid: { takeaway: 140, _table: ['matrix_data', 3, 3, 3, 3, 220] },
  definition: {
    main_statement: 240,
    elaboration: 230,
    footnote: 120,
    _list: ['key_points', 2, 3, { title: 45, desc: 150 }],
  },
  flow_diagram: {
    explanation: 340,
    _list: ['steps', 3, 4, { label: 12, title: 35, desc: 170 }],
    _desc_by_count: ['steps', { 3: 220, 4: 170 }],
    _highlight: ['steps', 1, 1],
    _decision_flow: [2, 40],
  },
  comparison_table: { takeaway: 140, _table: ['rows', 3, 4, 3, 4, 160] },
  case_block: {
    case_stem: 240,
    reasoning: 250,
    diagnosis: 50,
    clinical_pearl: 160,
    _strlist: ['findings', 2, 5, 80],
  },
  timeline: {
    _list: ['milestones', 3, 5, { label: 20, title: 40, desc: 110 }],
    _desc_by_count: ['milestones', { 3: 110, 4: 95, 5: 70 }],
  },
  learning_objectives: { _objectives: [3, 6, 25, 130] },
  glossary: { _list: ['terms', 4, 10, { term: 30, def: 130 }] },
  further_reading: { _list: ['entries', 3, 6, { title: 90, tag: 20, note: 100 }] },
  cycle_diagram: {
    center_label: 40,
    _list: ['nodes', 3, 6, { title: 40, desc: 90 }],
    _desc_by_count: ['nodes', { 3: 90, 4: 90, 5: 80, 6: 80 }],
    _highlight: ['nodes', 0, 2],
  },
  quadrant_matrix: { x_label: 45, y_label: 45, _quads: [40, 2, 5, 110] },
  pyramid: {
    _list: ['levels', 3, 5, { title: 55, desc: 90 }],
    _highlight: ['levels', 0, 1],
  },
  venn_diagram: { _venn: [30, 2, 4, 30, 1, 3, 45] },
  chart_data: { chart_type: 6, credit: 130, _chart: [2, 8, 1, 2, 30, 2, 3, 120, 25] },
  concept_map: {
    hub: 40,
    _list: ['nodes', 4, 6, { title: 35, desc: 80 }],
    _desc_by_count: ['nodes', { 4: 80, 5: 70, 6: 60 }],
    _highlight: ['nodes', 0, 2],
  },
  quote_block: { quote: 260, author: 60, source: 90, year: 12, context: 160 },
  socratic_question: {
    question: 220,
    context: 160,
    reading: 130,
    _strlist: ['scaffold', 2, 4, 90],
  },
  oxford_union: { motion: 140, verdict: 160, _debate: [{ title: 30 }, 2, 4, 110] },
  evidence_card: {
    study_name: 60,
    design: 60,
    population: 140,
    intervention: 140,
    comparison: 140,
    outcome: 140,
    effect: 14,
    effect_desc: 120,
    limitation: 160,
    year: 10,
    credit: 130,
  },
  viva_question: { prompt: 220, model_answer: 260, examiner_note: 180, difficulty: 12 },
  mnemonic_card: { acronym: 8, usage: 200, domain: 30, _acronym: ['expansion', 30] },
  etymology: {
    term: 30,
    modern: 160,
    _list: ['roots', 2, 3, { part: 20, origin: 20, meaning: 70 }],
  },
  references: { _strlist: ['refs', 3, 10, 160] },
  authority_card: {
    name: 60,
    dates: 30,
    epithet: 80,
    bio: 300,
    legacy: 120,
    caption: 110,
    credit: 130,
  },
  colloquy: { _colloquy: [4, 8, 160] },
  annotated_passage: {
    passage: 520,
    source: 90,
    _list: ['annotations', 2, 5, { ref: 6, note: 110 }],
  },
}

function rec(value: unknown): Rec {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Rec) : {}
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function over(errs: string[], loc: string, value: unknown, limit: number): void {
  if (typeof value === 'string' && value.length > limit) {
    errs.push(
      `${loc}: ${value.length} > ${limit} caracteres (sobran ${value.length - limit}; recorte a <= ${Math.floor(limit * 0.9)} para deixar margem)`,
    )
  }
}

function vList(val: unknown[], d: Rec, loc0: string, errs: string[], spec: Rec): void {
  const [key, lo, hi, fields] = val as [string, number, number, Record<string, number>]
  const items = arr(d[key])
  let fl = { ...fields }
  const descBy = spec._desc_by_count as [string, Record<number, number>] | undefined
  if (descBy && descBy[0] === key) {
    const dl = descBy[1][items.length]
    if (dl) fl = { ...fl, desc: dl }
  }
  if (!(lo <= items.length && items.length <= hi)) {
    errs.push(`${loc0}.${key}: ${items.length} ítems, esperado ${lo}-${hi}`)
  }
  items.forEach((it, j) => {
    const row = rec(it)
    for (const [fk, flim] of Object.entries(fl)) {
      over(errs, `${loc0}.${key}[${j}].${fk}`, row[fk] ?? '', flim)
    }
  })
}

function vStrList(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [key, lo, hi, lim] = val as [string, number, number, number]
  const items = arr(d[key])
  if (!(lo <= items.length && items.length <= hi)) {
    errs.push(`${loc0}.${key}: ${items.length} ítems, esperado ${lo}-${hi}`)
  }
  for (const s of items) over(errs, `${loc0}.${key}`, s, lim)
}

function vTable(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [key, rlo, rhi, clo, chi, lim] = val as [string, number, number, number, number, number]
  const rows = arr(d[key])
  const hdrs = arr(d.headers)
  const cw = d.col_widths
  if (!(rlo <= rows.length && rows.length <= rhi)) {
    errs.push(`${loc0}.${key}: ${rows.length} filas, esperado ${rlo}-${rhi}`)
  }
  if (!(clo <= hdrs.length && hdrs.length <= chi)) {
    errs.push(`${loc0}.headers: ${hdrs.length} columnas, esperado ${clo}-${chi}`)
  }
  if (Array.isArray(cw) && cw.length !== hdrs.length) {
    errs.push(
      `${loc0}.col_widths: ${cw.length} pesos vs ${hdrs.length} encabezados — un peso por encabezado, ni uno más`,
    )
  }
  if (Array.isArray(cw)) {
    cw.forEach((w, j) => {
      if (typeof w !== 'number' || w <= 0) {
        errs.push(`${loc0}.col_widths[${j}]: peso debe ser > 0`)
      }
    })
  }
  rows.forEach((row, r) => {
    const cells = arr(row)
    if (cells.length !== hdrs.length) {
      errs.push(
        `${loc0}.${key}[${r}]: ${cells.length} celdas vs ${hdrs.length} encabezados — no existe columna de etiqueta implícita: la 1.ª celda ES la 1.ª columna de headers`,
      )
    }
    cells.forEach((cell, j) => over(errs, `${loc0}.${key}[${r}][${j}]`, cell, lim))
  })
}

function vObjectives(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [lo, hi, vlim, tlim] = val as [number, number, number, number]
  const objs = arr(d.objectives)
  if (!(lo <= objs.length && objs.length <= hi)) {
    errs.push(`${loc0}.objectives: ${objs.length} objetivos, esperado ${lo}-${hi}`)
  }
  objs.forEach((raw, j) => {
    const o = rec(raw)
    over(errs, `${loc0}.objectives[${j}].verb`, o.verb ?? '', vlim)
    over(errs, `${loc0}.objectives[${j}].text`, o.text ?? '', tlim)
    const bl = String(o.bloom ?? '')
      .trim()
      .toLowerCase()
    if (bl && !BLOOM.has(bl)) {
      errs.push(
        `${loc0}.objectives[${j}].bloom: ${JSON.stringify(bl)} no válido (${[...BLOOM].join('|')})`,
      )
    }
  })
}

function vHighlight(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [key, lo, hi] = val as [string, number, number]
  const n = arr(d[key]).filter((s) => rec(s).highlight).length
  if (!(lo <= n && n <= hi)) {
    errs.push(`${loc0}: ${n} ${key} destacados, esperado ${lo}-${hi}`)
  }
}

function vDecision(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [maxDec, dlim] = val as [number, number]
  const steps = arr(d.steps)
  const ndec = steps.filter((s) => rec(s).decision).length
  if (ndec > maxDec) errs.push(`${loc0}: ${ndec} decisiones, máximo ${maxDec}`)
  if (ndec && d.explanation) {
    errs.push(`${loc0}: steps.decision no es compatible con explanation`)
  }
  steps.forEach((s, j) => {
    if (rec(s).decision) {
      over(errs, `${loc0}.steps[${j}].desc (ramificación NO)`, rec(s).desc ?? '', dlim)
    }
  })
}

function vSidedCards(
  val: unknown[],
  d: Rec,
  loc0: string,
  errs: string[],
  sides: readonly string[],
): void {
  const [fields, plo, phi, plim] = val as [Record<string, number>, number, number, number]
  for (const side of sides) {
    const c = rec(d[side])
    for (const [fk, flim] of Object.entries(fields)) {
      over(errs, `${loc0}.${side}.${fk}`, c[fk] ?? '', flim)
    }
    const pts = arr(c.points)
    if (!(plo <= pts.length && pts.length <= phi)) {
      errs.push(`${loc0}.${side}.points: ${pts.length}, esperado ${plo}-${phi}`)
    }
    for (const pt of pts) over(errs, `${loc0}.${side}.points`, pt, plim)
  }
}

function vCards(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  vSidedCards(val, d, loc0, errs, ['left_card', 'right_card'])
}

function vDebate(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  vSidedCards(val, d, loc0, errs, ['pro_card', 'con_card'])
}

function vAcronym(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [key, lim] = val as [string, number]
  const acr = String(d.acronym ?? '')
  const exp = arr(d[key])
  if (exp.length !== acr.length) {
    errs.push(`${loc0}.${key}: ${exp.length} términos para ${acr.length} letras`)
  }
  exp.forEach((e, j) => over(errs, `${loc0}.${key}[${j}]`, e, lim))
}

function vColloquy(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [lo, hi, tlim] = val as [number, number, number]
  const turns = arr(d.turns)
  if (!(lo <= turns.length && turns.length <= hi)) {
    errs.push(`${loc0}.turns: ${turns.length} turnos, esperado ${lo}-${hi}`)
  }
  turns.forEach((raw, j) => {
    const t = rec(raw)
    const sp = String(t.speaker ?? '')
      .trim()
      .toLowerCase()
    if (sp !== 'tutor' && sp !== 'student') {
      errs.push(`${loc0}.turns[${j}].speaker: ${JSON.stringify(sp)} no válido (tutor|student)`)
    }
    over(errs, `${loc0}.turns[${j}].text`, t.text ?? '', tlim)
  })
}

function vQuads(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [tlim, plo, phi, plim] = val as [number, number, number, number]
  const quads = arr(d.quadrants)
  if (quads.length !== 4) {
    errs.push(`${loc0}.quadrants: ${quads.length} cuadrantes, esperado 4`)
  }
  quads.forEach((raw, j) => {
    const q = rec(raw)
    over(errs, `${loc0}.quadrants[${j}].title`, q.title ?? '', tlim)
    const pts = arr(q.points)
    if (!(plo <= pts.length && pts.length <= phi)) {
      errs.push(`${loc0}.quadrants[${j}].points: ${pts.length}, esperado ${plo}-${phi}`)
    }
    for (const pt of pts) over(errs, `${loc0}.quadrants[${j}].points`, pt, plim)
  })
}

function vVenn(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [flab, slo, shi, ilim, hlo, hhi, hlim] = val as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  const sets = arr(d.sets)
  if (!(2 <= sets.length && sets.length <= 3)) {
    errs.push(`${loc0}.sets: ${sets.length} conjuntos, esperado 2-3`)
  }
  sets.forEach((raw, j) => {
    const st = rec(raw)
    over(errs, `${loc0}.sets[${j}].label`, st.label ?? '', flab)
    const items = arr(st.items)
    if (!(slo <= items.length && items.length <= shi)) {
      errs.push(`${loc0}.sets[${j}].items: ${items.length}, esperado ${slo}-${shi}`)
    }
    for (const e of items) over(errs, `${loc0}.sets[${j}].items`, e, ilim)
  })
  const sh = arr(d.shared)
  if (!(hlo <= sh.length && sh.length <= hhi)) {
    errs.push(`${loc0}.shared: ${sh.length}, esperado ${hlo}-${hhi}`)
  }
  for (const e of sh) over(errs, `${loc0}.shared`, e, hlim)
}

function vChart(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [clo, chi, snlo, snhi, snlim, inlo, inhi, inlim, catlim] = val as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  const cats = arr(d.categories)
  const series = arr(d.series)
  const ins = arr(d.insights)
  const ctype = d.chart_type ?? 'bar'
  if (ctype !== 'bar' && ctype !== 'line') {
    errs.push(`${loc0}.chart_type: usar "bar" o "line"`)
  }
  if (!(clo <= cats.length && cats.length <= chi)) {
    errs.push(`${loc0}.categories: ${cats.length}, esperado ${clo}-${chi}`)
  }
  cats.forEach((cv, j) => over(errs, `${loc0}.categories[${j}]`, cv, catlim))
  if (!(snlo <= series.length && series.length <= snhi)) {
    errs.push(`${loc0}.series: ${series.length}, esperado ${snlo}-${snhi}`)
  }
  series.forEach((raw, j) => {
    const sr = rec(raw)
    over(errs, `${loc0}.series[${j}].name`, sr.name ?? '', snlim)
    const vals = arr(sr.values)
    if (vals.length !== cats.length) {
      errs.push(`${loc0}.series[${j}].values: ${vals.length} vs ${cats.length} categorías`)
    }
    vals.forEach((v, k) => {
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        errs.push(`${loc0}.series[${j}].values[${k}]: valor no numérico (${JSON.stringify(v)})`)
      }
    })
  })
  if (!(inlo <= ins.length && ins.length <= inhi)) {
    errs.push(`${loc0}.insights: ${ins.length}, esperado ${inlo}-${inhi}`)
  }
  for (const e of ins) over(errs, `${loc0}.insights`, e, inlim)
}

function vExamples(val: unknown[], d: Rec, loc0: string, errs: string[]): void {
  const [mx, lim] = val as [number, number]
  arr(d.categories).forEach((raw, j) => {
    const exs = arr(rec(raw).examples)
    if (exs.length > mx) {
      errs.push(`${loc0}.categories[${j}].examples: ${exs.length} > ${mx}`)
    }
    for (const e of exs) over(errs, `${loc0}.categories[${j}].examples`, e, lim)
  })
}

function requiredEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  return !String(value).trim()
}

export function lintContract(slide: StudySlide, loc0: string, errs: string[]): void {
  const d = slide as unknown as Rec
  const mod = slide.module
  const spec = B[mod]
  if (!spec) return
  if (!NO_HEADER.has(mod)) {
    for (const [field, limit] of Object.entries(COMMON)) {
      over(errs, `${loc0}.${field}`, d[field] ?? '', limit)
    }
  }
  for (const [field, limit] of Object.entries(spec)) {
    if (field.startsWith('_')) continue
    over(errs, `${loc0}.${field}`, d[field] ?? '', limit as number)
  }
  for (const field of REQUIRED[mod] ?? []) {
    if (requiredEmpty(d[field])) {
      errs.push(`${loc0}.${field}: campo obrigatorio ausente ou vazio`)
    }
  }
  if (spec._list) vList(spec._list as unknown[], d, loc0, errs, spec)
  if (spec._strlist) vStrList(spec._strlist as unknown[], d, loc0, errs)
  if (spec._table) vTable(spec._table as unknown[], d, loc0, errs)
  if (spec._objectives) vObjectives(spec._objectives as unknown[], d, loc0, errs)
  if (spec._highlight) vHighlight(spec._highlight as unknown[], d, loc0, errs)
  if (spec._decision_flow) vDecision(spec._decision_flow as unknown[], d, loc0, errs)
  if (spec._cards) vCards(spec._cards as unknown[], d, loc0, errs)
  if (spec._examples) vExamples(spec._examples as unknown[], d, loc0, errs)
  if (spec._quads) vQuads(spec._quads as unknown[], d, loc0, errs)
  if (spec._venn) vVenn(spec._venn as unknown[], d, loc0, errs)
  if (spec._chart) vChart(spec._chart as unknown[], d, loc0, errs)
  if (spec._debate) vDebate(spec._debate as unknown[], d, loc0, errs)
  if (spec._acronym) vAcronym(spec._acronym as unknown[], d, loc0, errs)
  if (spec._colloquy) vColloquy(spec._colloquy as unknown[], d, loc0, errs)
  if (mod === 'etymology') {
    const frags = arr(d.fragments).map((f) => String(f))
    const roots = arr(d.roots)
    if (frags.length && (frags.length !== roots.length || frags.join('') !== String(d.term ?? ''))) {
      errs.push(
        `${loc0}.fragments: debe concatenar exactamente en term y tener len(roots) elementos (tiene ${frags.length})`,
      )
    }
  }
  if (mod === 'annotated_passage') {
    const marks = new Set([...String(d.passage ?? '').matchAll(/\[(\d+)\]/g)].map((m) => m[1]!))
    const have = new Set(arr(d.annotations).map((a) => String(rec(a).ref ?? '').trim()))
    const missing = [...marks].filter((m) => !have.has(m)).sort((a, b) => Number(a) - Number(b))
    if (missing.length) {
      errs.push(`${loc0}: marcadores ${JSON.stringify(missing)} del passage sin nota en annotations`)
    }
  }
  lintFit(slide, loc0, errs)
}

type FitBox = readonly [field: string, boxW: number, boxH: number, sizePt: number]

export function fitBoxes(slide: StudySlide): readonly FitBox[] {
  const img = Boolean((slide as unknown as Rec).image)
  switch (slide.module) {
    case 'title':
      return [['title', 10.933, 2.1, 38]]
    case 'section_divider':
      return [
        ['section_title', 11.0, 1.8, 36],
        ['section_subtitle', 10.5, 1.5, 15],
      ]
    case 'definition':
      return [
        ['main_statement', img ? 7.1 : 11.5, 0.95, 15.5],
        ['elaboration', img ? 7.2 : 11.6, ELABORATION_H, 12],
      ]
    case 'stat_card':
      return [['stat_title', 3.9, 1.8, 13.5]]
    case 'case_block':
      return [
        ['case_stem', img ? 4.2 : 5.45, 1.6, 11.5],
        ['reasoning', img ? 4.1 : 5.4, 1.9, 10.8],
        ['clinical_pearl', img ? 4.1 : 5.4, 1.15, 10.8],
      ]
    case 'quote_block':
      return [['quote', 9.4, 2.3, 20]]
    case 'socratic_question':
      return [['question', 9.9, 1.6, 20]]
    case 'oxford_union':
      return [['motion', 11.4, 0.68, 17]]
    case 'viva_question':
      return [
        ['prompt', 5.1, 3.6, 16],
        ['model_answer', 5.6, 2.0, 11.5],
      ]
    case 'authority_card':
      return [['bio', 7.8, 2.4, 11.5]]
    case 'evidence_card':
      return [
        ['population', 6.5, 0.85, 11],
        ['intervention', 6.5, 0.85, 11],
        ['comparison', 6.5, 0.85, 11],
        ['outcome', 6.5, 0.85, 11],
      ]
    case 'annotated_passage':
      return [['passage', 6.7, 4.15, 13]]
    default:
      return []
  }
}

function lintFit(slide: StudySlide, loc0: string, errs: string[]): void {
  const d = slide as unknown as Rec
  for (const [field, boxW, boxH, sizePt] of fitBoxes(slide)) {
    const need = estHeight(String(d[field] ?? ''), boxW, sizePt)
    if (need > boxH * FIT_TOLERANCE) {
      errs.push(
        `${loc0}.${field}: transbordo estimado (${need.toFixed(2)}in > ${boxH.toFixed(2)}in) — encurte o texto`,
      )
    }
  }
}

export function visitMarker(text: string, loc: string, errs: string[]): void {
  if (MARKER.test(text.trim())) {
    errs.push(`${loc}: marcador sin substituir "${text.trim()}" — escreva conteudo real`)
  }
}

/** Layer B budget blob for `study schema` (3.zip `MODULES[m]['schema']`). */
export function contractOf(mod: StudySlide['module']): Rec {
  return B[mod]
}
