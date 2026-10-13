/** Paste-ready module catalog — 3.zip `authoring.skeleton` / `constraints`. */
import { COMMON, contractOf, NO_HEADER, REQUIRED } from './contracts'
import type { StudySlide } from './types'
import { WHEN } from './when'

type Rec = Record<string, unknown>

function skel(lim: number): string {
  return `<= ${lim} car.>`
}

function rec(value: unknown): Rec {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Rec) : {}
}

export function listStudyModules(): { module: StudySlide['module']; when: string }[] {
  return (Object.keys(WHEN) as StudySlide['module'][])
    .sort()
    .map((module) => ({ module, when: WHEN[module] }))
}

export function describeStudyModule(name: string): {
  module: StudySlide['module']
  when: string
  required: readonly string[]
  skeleton: Rec
} | null {
  if (!(name in WHEN)) return null
  const module = name as StudySlide['module']
  return {
    module,
    when: WHEN[module],
    required: REQUIRED[module],
    skeleton: skeletonOf(module),
  }
}

export function skeletonOf(m: StudySlide['module']): Rec {
  const spec = contractOf(m)
  const d: Rec = { module: m }
  if (!NO_HEADER.has(m)) {
    d.kicker = skel(COMMON.kicker!)
    d.title = skel(COMMON.title!)
  }
  for (const [k, v] of Object.entries(spec)) {
    if (k.startsWith('_')) continue
    d[k] = typeof v === 'number' ? skel(v) : v
  }
  if (m === 'figure' || m === 'authority_card') {
    d.image = 'work/imgs/nombre_snake_case.jpg'
  }
  if (spec._list) {
    const [key, lo, , fl] = spec._list as [string, number, number, Record<string, number>]
    const rows = Array.from({ length: lo }, () => {
      const row: Rec = {}
      for (const [fk, fv] of Object.entries(fl)) row[fk] = skel(fv)
      return row
    })
    if (spec._examples) {
      const [mx, lim] = spec._examples as [number, number]
      for (const it of rows) it.examples = Array.from({ length: Math.min(mx, 2) }, () => skel(lim))
    }
    d[key] = rows
  }
  if (spec._strlist) {
    const [key, lo, , lim] = spec._strlist as [string, number, number, number]
    d[key] = Array.from({ length: lo }, () => skel(lim))
  }
  if (spec._table) {
    const [key, rlo, , clo, , lim] = spec._table as [
      string,
      number,
      number,
      number,
      number,
      number,
    ]
    d.headers = Array.from({ length: clo }, () => skel(lim))
    d.col_widths = Array.from({ length: clo }, () => 2.0)
    d[key] = Array.from({ length: rlo }, () => Array.from({ length: clo }, () => skel(lim)))
  }
  for (const [specKey, sides] of [
    ['_cards', ['left_card', 'right_card']],
    ['_debate', ['pro_card', 'con_card']],
  ] as const) {
    if (!spec[specKey]) continue
    const [fl, plo, , plim] = spec[specKey] as [Record<string, number>, number, number, number]
    for (const side of sides) {
      const card: Rec = {}
      for (const [fk, fv] of Object.entries(fl)) card[fk] = skel(fv)
      card.points = Array.from({ length: plo }, () => skel(plim))
      d[side] = card
    }
  }
  if (spec._quads) {
    const [tlim, plo, , plim] = spec._quads as [number, number, number, number]
    d.quadrants = Array.from({ length: 4 }, () => ({
      title: skel(tlim),
      points: Array.from({ length: plo }, () => skel(plim)),
    }))
  }
  if (spec._venn) {
    const [flab, slo, , ilim, hlo, , hlim] = spec._venn as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]
    d.sets = Array.from({ length: 2 }, () => ({
      label: skel(flab),
      items: Array.from({ length: slo }, () => skel(ilim)),
    }))
    d.shared = Array.from({ length: hlo }, () => skel(hlim))
  }
  if (spec._chart) {
    const [clo, , snlo, , snlim, inlo, , inlim, catlim] = spec._chart as [
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
    d.chart_type = 'bar'
    d.categories = Array.from({ length: clo }, () => skel(catlim))
    d.series = Array.from({ length: snlo }, () => ({
      name: skel(snlim),
      values: Array.from({ length: clo }, () => 0),
    }))
    d.insights = Array.from({ length: inlo }, () => skel(inlim))
  }
  if (spec._acronym) {
    const [key, lim] = spec._acronym as [string, number]
    d.acronym = 'ABC'
    d[key] = Array.from({ length: 3 }, () => skel(lim))
  }
  if (spec._objectives) {
    const [lo, , vlim, tlim] = spec._objectives as [number, number, number, number]
    d.objectives = Array.from({ length: lo }, () => ({
      verb: skel(vlim),
      text: skel(tlim),
      bloom: 'understand',
    }))
  }
  if (spec._colloquy) {
    const [lo, , tlim] = spec._colloquy as [number, number, number]
    d.turns = Array.from({ length: lo }, (_, i) => ({
      speaker: i % 2 === 0 ? 'tutor' : 'student',
      text: skel(tlim),
    }))
  }
  if (spec._highlight) {
    const [key, lo] = spec._highlight as [string, number, number]
    const items = d[key]
    if (lo >= 1 && Array.isArray(items) && items[0]) rec(items[0]).highlight = true
  }
  if (m === 'etymology') {
    d.term = 'Apendicitis'
    d.fragments = ['Apendic', 'itis']
  }
  if (!NO_HEADER.has(m)) d.footnote = d.footnote ?? skel(COMMON.footnote!)
  return d
}
