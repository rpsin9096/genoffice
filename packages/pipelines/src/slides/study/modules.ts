/** Deterministic module renderers for the 10 inflamacao slides (study-deck 3.zip). */
import {
  CARD_SLOT,
  CANVAS_W,
  COMPACT,
  CONTENT_BAND_H,
  CONTENT_BOTTOM,
  CONTENT_H,
  CONTENT_W,
  ELABORATION_H,
  ROOT_CARD_TEXT_H,
  SAFE_X0,
  SAFE_Y0,
  STANDARD,
  TIMELINE_MAX,
  blockHeight,
  rowLayout,
  stackLayout,
  tierFor,
  tierForBlock,
  typePt,
  type Tier,
} from './geometry'
import { T, bloom } from './i18n'
import { inkOn, UCP, UCP_TOKENS } from './palette-ucp'
import { Painter } from './painter'
import type { StudySlide } from './types'

export function paintModule(p: Painter, slide: StudySlide, course: string, index: number): Tier {
  const noChrome = slide.module === 'title' || slide.module === 'section_divider'
  if (!noChrome) {
    p.header('kicker' in slide ? slide.kicker : undefined, titleOf(slide))
    p.footer(course, index)
  }
  switch (slide.module) {
    case 'title':
      return paintTitle(p, slide)
    case 'section_divider':
      return paintDivider(p, slide)
    case 'figure':
      return paintFigure(p, slide)
    case 'stat_card':
      return paintStat(p, slide)
    case 'checklist':
      return paintChecklist(p, slide)
    case 'fixed_schema_card':
      return paintSchema(p, slide)
    case 'side_by_side':
      return paintSide(p, slide)
    case 'taxonomy_tree':
      return paintTaxonomy(p, slide)
    case 'algorithm':
      return paintAlgorithm(p, slide)
    case 'synthesis_grid':
      return paintSynthesis(p, slide)
    case 'definition':
      return paintDefinition(p, slide)
    case 'learning_objectives':
      return paintObjectives(p, slide)
    case 'timeline':
      return paintTimeline(p, slide)
    case 'comparison_table':
      return paintTable(p, slide)
    case 'flow_diagram':
      return paintFlow(p, slide)
    case 'case_block':
      return paintCase(p, slide)
    case 'glossary':
      return paintGlossary(p, slide)
    case 'further_reading':
      return paintReading(p, slide)
    case 'cycle_diagram':
      return paintCycle(p, slide)
    case 'quadrant_matrix':
      return paintQuadrant(p, slide)
    case 'pyramid':
      return paintPyramid(p, slide)
    case 'venn_diagram':
      return paintVenn(p, slide)
    case 'concept_map':
      return paintConcept(p, slide)
    case 'chart_data':
      return paintChart(p, slide)
    case 'quote_block':
      return paintQuote(p, slide)
    case 'socratic_question':
      return paintSocratic(p, slide)
    case 'oxford_union':
      return paintOxford(p, slide)
    case 'evidence_card':
      return paintEvidence(p, slide)
    case 'viva_question':
      return paintViva(p, slide)
    case 'mnemonic_card':
      return paintMnemonic(p, slide)
    case 'etymology':
      return paintEtymology(p, slide)
    case 'references':
      return paintRefs(p, slide)
    case 'authority_card':
      return paintAuthority(p, slide)
    case 'colloquy':
      return paintColloquy(p, slide)
    case 'annotated_passage':
      return paintPassage(p, slide)
  }
}

export function titleOf(slide: StudySlide): string {
  if ('title' in slide && slide.title) return slide.title
  if (slide.module === 'section_divider') return slide.section_title
  if (slide.module === 'title') return slide.title
  return slide.module
}

function paintTitle(p: Painter, d: Extract<StudySlide, { module: 'title' }>): Tier {
  p.rect(0, 0, 13.333, 0.18, UCP.accent, { rounded: false })
  p.rect(0, 7.32, 13.333, 0.18, UCP.accent, { rounded: false })
  p.rect(0.8, 0.7, 11.733, 6.1, null, { stroke: UCP.accent, strokePt: 1, rounded: true })
  const course = d.course ?? ''
  if (course) {
    p.tx(1.2, 1.35, 10.933, 0.4, course.toUpperCase(), 12, UCP_TOKENS.on_primary, UCP.primary, {
      bold: true,
      align: 'center',
    })
  }
  p.tx(1.2, 2.1, 10.933, 2.1, d.title || course, 38, UCP_TOKENS.on_primary, UCP.primary, {
    bold: true,
    align: 'center',
    lineSp: 1.08,
  })
  p.rect(5.86, 4.45, 1.6, 0.03, UCP.accent, { rounded: false })
  if (d.subtitle) {
    p.tx(1.5, 4.75, 10.333, 0.7, d.subtitle, 15, UCP_TOKENS.subtitle_on_primary, UCP.primary, {
      align: 'center',
      italic: true,
    })
  }
  if (d.institution) {
    p.tx(
      1.5,
      5.85,
      10.333,
      0.4,
      d.institution.toUpperCase(),
      10,
      UCP_TOKENS.on_primary_soft,
      UCP.primary,
      {
        align: 'center',
        bold: true,
      },
    )
  }
  if (d.author) {
    p.tx(1.5, 6.25, 10.333, 0.35, d.author, 11, UCP_TOKENS.on_primary, UCP.primary, {
      align: 'center',
      italic: true,
    })
  }
  return STANDARD
}

function paintFootnote(p: Painter, d: { footnote?: string; credit?: string }, y = 6.62): void {
  let combined = d.footnote ?? ''
  if (d.credit && !d.footnote) combined = T('source').replace('{c}', d.credit)
  else if (d.credit && d.footnote && !d.footnote.includes(d.credit)) {
    combined = T('join').replace('{f}', d.footnote).replace('{c}', d.credit)
  }
  if (combined) {
    p.tx(SAFE_X0, y, CONTENT_W, 0.28, combined, 9, UCP.text_muted, UCP.bg, { italic: true })
  }
}

function paintFigure(p: Painter, d: Extract<StudySlide, { module: 'figure' }>): Tier {
  p.placeImage(SAFE_X0, SAFE_Y0, CONTENT_W, 4.75, d.image)
  if (d.caption) {
    p.tx(SAFE_X0, 6.3, CONTENT_W, 0.28, d.caption, 10.5, UCP.text, UCP.bg, { italic: true })
  }
  paintFootnote(p, d)
  return STANDARD
}

function paintStat(p: Painter, d: Extract<StudySlide, { module: 'stat_card' }>): Tier {
  p.rect(SAFE_X0, SAFE_Y0, 4.4, CONTENT_BAND_H, UCP.primary, { rounded: true })
  p.rect(SAFE_X0, SAFE_Y0, 4.4, 0.06, UCP.accent, { rounded: false })
  p.tx(0.85, 2.2, 4.0, 1.6, d.stat_num, 52, UCP_TOKENS.on_primary, UCP.primary, {
    bold: true,
    align: 'center',
  })
  p.rect(2.25, 4.0, 1.2, 0.025, UCP.accent, { rounded: false })
  p.tx(0.9, 4.25, 3.9, 1.8, d.stat_title, 13.5, UCP_TOKENS.on_primary, UCP.primary, {
    align: 'center',
    lineSp: 1.15,
  })
  const img = Boolean(d.image)
  const bw = img ? 3.6 : 7.3
  const bx = img ? 4.25 : 5.35
  const blocks = d.narrative_blocks ?? []
  const n = Math.max(blocks.length, 1)
  const gap = 0.2
  const bh = (CONTENT_BAND_H - gap * (n - 1)) / n
  blocks.forEach((b, i) => {
    const y = SAFE_Y0 + i * (bh + gap)
    p.rect(bx, y, bw, bh, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(bx, y, 0.06, bh, UCP.accent, { rounded: false })
    p.tx(bx + 0.25, y + 0.12, bw - 0.45, 0.32, b.title, 12.5, UCP.primary, UCP.card, { bold: true })
    if (b.desc) {
      p.tx(
        bx + 0.25,
        y + 0.48,
        bw - 0.45,
        Math.max(bh - 0.6, 0.2),
        b.desc,
        11,
        UCP.text,
        UCP.card,
        {
          lineSp: 1.1,
        },
      )
    }
  })
  if (d.image) p.placeImage(8.05, SAFE_Y0, 4.6, CONTENT_BAND_H, d.image)
  paintFootnote(p, d)
  return STANDARD
}

function paintChecklist(p: Painter, d: Extract<StudySlide, { module: 'checklist' }>): Tier {
  const items = d.items ?? []
  const n = Math.max(items.length, 1)
  const gap = 0.16
  const { rowH: ih, yFirst } = stackLayout(SAFE_Y0, CONTENT_BAND_H, n, gap, 1.0)
  const rw = d.image ? 7.5 : CONTENT_W
  const ok = UCP_TOKENS.ink_success
  items.forEach((it, i) => {
    const y = yFirst + i * (ih + gap)
    const checked = it.checked !== false
    const mark = checked ? '✓' : '✕'
    const mcol = checked ? ok : UCP.alert
    p.rect(SAFE_X0, y, rw, ih, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(0.85, y + ih / 2 - 0.18, 0.36, 0.36, UCP.soft, { stroke: mcol, strokePt: 1.2 })
    p.tx(0.85, y + ih / 2 - 0.2, 0.36, 0.36, mark, 14, mcol, UCP.soft, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
    p.tx(1.4, y + 0.08, rw - 0.85, 0.32, it.label, 12.5, UCP.primary, UCP.card, { bold: true })
    if (it.desc) {
      p.tx(1.4, y + 0.42, rw - 0.85, Math.max(ih - 0.5, 0.2), it.desc, 10.8, UCP.text, UCP.card, {
        lineSp: 1.05,
      })
    }
  })
  if (d.image) p.placeImage(8.35, SAFE_Y0, 4.3, CONTENT_BAND_H, d.image)
  paintFootnote(p, d)
  return STANDARD
}

function paintSchema(p: Painter, d: Extract<StudySlide, { module: 'fixed_schema_card' }>): Tier {
  const fields = d.fields ?? []
  const n = Math.max(fields.length, 1)
  const gap = 0.16
  const { rowH: fh, yFirst } = stackLayout(SAFE_Y0, CONTENT_BAND_H, n, gap, 1.1)
  fields.forEach((f, i) => {
    const y = yFirst + i * (fh + gap)
    p.rect(SAFE_X0, y, 3.4, fh, UCP.primary, { rounded: true })
    p.tx(0.85, y, 3.0, fh, (f.label ?? '').toUpperCase(), 11, UCP_TOKENS.on_primary, UCP.primary, {
      bold: true,
      valign: 'middle',
    })
    p.rect(4.15, y, 8.5, fh, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.tx(4.35, y, 8.1, fh, f.value ?? '', 11.5, UCP.text, UCP.card, {
      valign: 'middle',
      lineSp: 1.1,
    })
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintColumnCard(
  p: Painter,
  x: number,
  w: number,
  card: { header?: string; title?: string; points?: string[] },
  accent: string,
  onAccent: string,
): void {
  p.rect(x, SAFE_Y0, w, CONTENT_BAND_H, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  p.rect(x, SAFE_Y0, w, 0.48, accent, { rounded: false })
  p.tx(x + 0.25, 1.62, w - 0.5, 0.35, (card.header ?? '').toUpperCase(), 10.5, onAccent, accent, {
    bold: true,
  })
  p.tx(x + 0.25, 2.15, w - 0.5, 0.55, card.title ?? '', 15, UCP.primary, UCP.card, { bold: true })
  ;(card.points ?? []).forEach((pt, i) => {
    p.tx(x + 0.25, 2.75 + i * 0.55, w - 0.5, 0.5, `• ${pt}`, 11.2, UCP.text, UCP.card, {
      lineSp: 1.1,
    })
  })
}

function paintSide(p: Painter, d: Extract<StudySlide, { module: 'side_by_side' }>): Tier {
  const mw = 5.88
  paintColumnCard(p, SAFE_X0, mw, d.left_card ?? {}, UCP.primary, UCP_TOKENS.on_primary)
  paintColumnCard(p, 6.77, mw, d.right_card ?? {}, UCP.accent, UCP_TOKENS.on_accent)
  paintFootnote(p, d)
  return STANDARD
}

function paintTaxonomy(p: Painter, d: Extract<StudySlide, { module: 'taxonomy_tree' }>): Tier {
  const cats = d.categories ?? []
  const n = Math.max(cats.length, 1)
  const gap = 0.28
  const { itemW: w } = rowLayout(SAFE_X0, CONTENT_W, n, gap)
  const root = d.root || d.title
  p.rect(4.15, 1.5, 5.0, 0.55, UCP.primary, { rounded: true })
  p.tx(4.25, 1.5, 4.8, 0.55, root.toUpperCase(), 12.5, UCP_TOKENS.on_primary, UCP.primary, {
    bold: true,
    align: 'center',
    valign: 'middle',
  })
  p.rect(6.64, 2.05, 0.02, 0.35, UCP.accent, { rounded: false })
  p.rect(SAFE_X0 + w / 2, 2.4, CONTENT_W - w, 0.02, UCP.accent, { rounded: false })
  cats.forEach((c, i) => {
    const x = SAFE_X0 + i * (w + gap)
    p.rect(x + w / 2 - 0.01, 2.4, 0.02, 0.3, UCP.accent, { rounded: false })
    p.rect(x, 2.7, w, 3.85, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(x, 2.7, w, 0.45, UCP.soft, { rounded: false })
    p.tx(x + 0.15, 2.75, w - 0.3, 0.35, (c.name ?? '').toUpperCase(), 11, UCP.primary, UCP.soft, {
      bold: true,
      align: 'center',
    })
    if (c.property) {
      p.tx(x + 0.2, 3.25, w - 0.4, 0.4, c.property, 11, UCP_TOKENS.ink_accent, UCP.card, {
        italic: true,
      })
    }
    ;(c.examples ?? []).forEach((ex, j) => {
      p.tx(x + 0.2, 3.7 + j * 0.4, w - 0.4, 0.38, `• ${ex}`, 10.5, UCP.text, UCP.card, {
        lineSp: 1.08,
      })
    })
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintAlgorithm(p: Painter, d: Extract<StudySlide, { module: 'algorithm' }>): Tier {
  const steps = d.steps ?? []
  const n = Math.max(steps.length, 1)
  const gap = 0.16
  const { rowH: sh, yFirst } = stackLayout(SAFE_Y0, CONTENT_BAND_H, n, gap, 1.2)
  steps.forEach((st, i) => {
    const y = yFirst + i * (sh + gap)
    const hi = Boolean(st.highlight)
    const med = hi ? UCP.accent : UCP.primary
    const on = hi ? UCP_TOKENS.on_accent : UCP_TOKENS.on_primary
    p.rect(SAFE_X0, y, 0.9, sh, med, { rounded: true })
    p.tx(SAFE_X0, y, 0.9, sh, st.label ?? String(i + 1).padStart(2, '0'), 16, on, med, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
    if (i < n - 1) p.rect(1.09, y + sh, 0.02, gap, UCP.border, { rounded: false })
    p.rect(1.7, y, 10.95, sh, UCP.card, {
      stroke: hi ? UCP.accent : UCP.border,
      strokePt: hi ? 1 : 0.6,
    })
    p.tx(1.95, y + 0.08, 10.4, 0.35, st.title, 12.5, UCP.primary, UCP.card, { bold: true })
    if (st.desc) {
      p.tx(1.95, y + 0.44, 10.4, Math.max(sh - 0.52, 0.2), st.desc, 10.8, UCP.text, UCP.card, {
        lineSp: 1.05,
      })
    }
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintDivider(p: Painter, d: Extract<StudySlide, { module: 'section_divider' }>): Tier {
  p.rect(0, 0, 0.4, 7.5, UCP.accent, { rounded: false })
  p.tx(1.2, 1.5, 11.0, 0.5, T('chapter'), 14, UCP_TOKENS.on_primary, UCP.primary, { bold: true })
  p.tx(1.2, 2.2, 11.0, 1.8, d.section_title, 36, UCP_TOKENS.on_primary, UCP.primary, {
    bold: true,
    lineSp: 1.1,
  })
  p.rect(1.2, 4.25, 2.0, 0.03, UCP.accent, { rounded: false })
  if (d.section_subtitle) {
    p.tx(1.2, 4.6, 10.5, 1.5, d.section_subtitle, 15, UCP_TOKENS.subtitle_on_primary, UCP.primary, {
      italic: true,
      lineSp: 1.2,
    })
  }
  return STANDARD
}

function paintDefinition(p: Painter, d: Extract<StudySlide, { module: 'definition' }>): Tier {
  const cw = CONTENT_W
  p.rect(SAFE_X0, SAFE_Y0, cw, 1.45, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  p.rect(SAFE_X0, SAFE_Y0, 0.09, 1.45, UCP.primary, { rounded: false })
  p.pill(0.95, 1.68, 1.6, 0.24, T('central'), UCP.soft, inkOn(UCP.soft), 9)
  p.tx(0.95, 1.98, cw - 0.5, 0.95, d.main_statement, 15.5, UCP.primary, UCP.card, {
    bold: true,
    lineSp: 1.1,
  })
  let y = 3.15
  if (d.elaboration) {
    p.rect(SAFE_X0, y, cw, 0.85, UCP.soft, { stroke: UCP.border, strokePt: 0.4 })
    p.tx(0.85, y + 0.12, cw - 0.4, ELABORATION_H, d.elaboration, 12, UCP.text, UCP.soft, {
      lineSp: 1.15,
    })
    y += 1.0
  }
  const kps = d.key_points ?? []
  let tier: Tier = STANDARD
  if (kps.length > 0) {
    const n = kps.length
    const gapStd = 0.22
    const wStd = (cw - gapStd * (n - 1)) / n
    const ch = CONTENT_BOTTOM - y
    tier = tierFor(
      kps.map((k) => k.desc),
      wStd - 0.4,
      11.0,
      ch,
    )
    const gap = tier === COMPACT ? COMPACT.gap : gapStd
    const w = (cw - gap * (n - 1)) / n
    const descPt = typePt(11.0, tier, true)
    const titlePt = typePt(12.5, tier)
    for (let i = 0; i < n; i += 1) {
      const x = SAFE_X0 + i * (w + gap)
      const kp = kps[i]!
      p.rect(x, y, w, ch, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
      p.rect(x, y, w, 0.05, UCP.accent, { rounded: false })
      p.tx(x + 0.2, y + 0.18, w - 0.4, 0.4, kp.title, titlePt, UCP.primary, UCP.card, {
        bold: true,
      })
      p.tx(x + 0.2, y + 0.58, w - 0.4, ch - 0.75, kp.desc, descPt, UCP.text, UCP.card, {
        lineSp: 1.1,
      })
    }
  }
  return tier
}

function paintObjectives(
  p: Painter,
  d: Extract<StudySlide, { module: 'learning_objectives' }>,
): Tier {
  p.pill(SAFE_X0, 1.28, 2.9, 0.34, T('objectives'), UCP.soft, UCP.primary)
  const objs = d.objectives ?? []
  const n = Math.max(objs.length, 1)
  const { rowH, yFirst } = stackLayout(2.15, 4.32, n, 0.14, 1.25)
  objs.forEach((obj, i) => {
    const y = yFirst + i * (rowH + 0.14)
    p.rect(SAFE_X0, y, CONTENT_W, rowH, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(SAFE_X0, y, 0.07, rowH, UCP.accent, { rounded: false })
    p.rect(0.9, y + rowH / 2 - 0.22, 0.44, 0.44, UCP.primary)
    p.tx(
      0.9,
      y + rowH / 2 - 0.22,
      0.44,
      0.44,
      String(i + 1),
      12,
      UCP_TOKENS.on_primary,
      UCP.primary,
      {
        bold: true,
        align: 'center',
        valign: 'middle',
      },
    )
    const verb = `${String(obj.verb ?? '').toUpperCase()} — ${obj.text ?? ''}`
    p.tx(1.55, y + 0.1, 8.85, rowH - 0.2, verb, 11.5, UCP.primary, UCP.card, { valign: 'middle' })
    if (obj.bloom) {
      p.pill(
        10.6,
        y + rowH / 2 - 0.17,
        1.85,
        0.34,
        bloom(obj.bloom).toUpperCase(),
        UCP.soft,
        UCP_TOKENS.ink_accent,
        9,
      )
    }
  })
  return STANDARD
}

function paintTimeline(p: Painter, d: Extract<StudySlide, { module: 'timeline' }>): Tier {
  const miles = (d.milestones ?? []).slice(0, TIMELINE_MAX)
  const n = Math.max(miles.length, 1)
  const yMid = 4.0
  const x0 = 1.0
  const x1 = 12.35
  p.rect(x0, yMid, x1 - x0, 0.035, UCP.accent, { rounded: false })
  const span = (x1 - x0) / n
  const cw = Math.min(span - 0.3, 2.6)
  const block = miles
    .map((ms) => [ms.label, ms.title, ms.desc].filter(Boolean).join('\n'))
    .reduce((a, b) => (a.length >= b.length ? a : b), '')
  const tier = tierForBlock(block, cw - 0.3, 12.0, CARD_SLOT)
  const ch = blockHeight(block, cw - 0.3, 12.0, CARD_SLOT, tier)
  const fsz = typePt(10.2, tier, true)
  miles.forEach((ms, i) => {
    const cx = x0 + span * (i + 0.5)
    const up = i % 2 === 0
    const cy = up ? yMid - 0.25 - ch : yMid + 0.25
    p.rect(cx - 0.09, yMid - 0.075, 0.18, 0.18, UCP.primary, { shape: 'ellipse' })
    if (up)
      p.rect(cx - 0.01, cy + ch, 0.02, Math.max(yMid - 0.09 - (cy + ch), 0.02), UCP.border, {
        rounded: false,
      })
    else
      p.rect(cx - 0.01, yMid + 0.11, 0.02, Math.max(cy - (yMid + 0.11), 0.02), UCP.border, {
        rounded: false,
      })
    p.rect(cx - cw / 2, cy, cw, ch, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(cx - cw / 2, cy, cw, 0.05, up ? UCP.accent : UCP.primary, { rounded: false })
    p.tx(
      cx - cw / 2 + 0.15,
      cy + 0.15,
      cw - 0.3,
      0.28,
      ms.label,
      9.5,
      UCP_TOKENS.ink_accent,
      UCP.card,
      { bold: true },
    )
    p.tx(cx - cw / 2 + 0.15, cy + 0.42, cw - 0.3, 0.32, ms.title, 12, UCP.primary, UCP.card, {
      bold: true,
    })
    if (ms.desc) {
      p.tx(cx - cw / 2 + 0.15, cy + 0.74, cw - 0.3, ch - 0.9, ms.desc, fsz, UCP.text, UCP.card, {
        lineSp: 1.05,
      })
    }
  })
  return tier
}

function paintSynthesis(p: Painter, d: Extract<StudySlide, { module: 'synthesis_grid' }>): Tier {
  return paintGrid(p, d, d.matrix_data ?? [])
}

function paintTable(p: Painter, d: Extract<StudySlide, { module: 'comparison_table' }>): Tier {
  return paintGrid(p, d, d.rows ?? [])
}

function paintGrid(
  p: Painter,
  d: { headers?: string[]; col_widths?: number[]; takeaway?: string },
  rows: string[][],
): Tier {
  const headers = d.headers ?? []
  const takeaway = d.takeaway ?? ''
  const tblH = takeaway ? 4.1 : 4.7
  const yTop = 1.6
  const cols = Math.max(headers.length, 1)
  const weights = d.col_widths && d.col_widths.length === cols ? d.col_widths : headers.map(() => 1)
  const total = weights.reduce((a, b) => a + b, 0) || 1
  const colW = weights.map((w) => (CONTENT_W * w) / total)
  const rowH = tblH / (rows.length + 1)
  let x = SAFE_X0
  headers.forEach((h, j) => {
    p.rect(x, yTop, colW[j]!, rowH, UCP.primary, { rounded: false })
    p.tx(
      x + 0.1,
      yTop + 0.08,
      colW[j]! - 0.2,
      rowH - 0.16,
      String(h).toUpperCase(),
      11,
      UCP_TOKENS.on_primary,
      UCP.primary,
      {
        bold: true,
        valign: 'middle',
      },
    )
    x += colW[j]!
  })
  rows.forEach((row, i) => {
    const y = yTop + (i + 1) * rowH
    const fill = i % 2 === 0 ? UCP.card : UCP.soft
    let cx = SAFE_X0
    headers.forEach((_h, j) => {
      const val = String(row[j] ?? '')
      p.rect(cx, y, colW[j]!, rowH, fill, { rounded: false, stroke: UCP.border, strokePt: 0.4 })
      p.tx(
        cx + 0.1,
        y + 0.06,
        colW[j]! - 0.2,
        rowH - 0.12,
        val,
        11,
        j === 0 ? UCP.primary : UCP.text,
        fill,
        {
          bold: j === 0,
          valign: 'middle',
        },
      )
      cx += colW[j]!
    })
  })
  if (takeaway) {
    const y = yTop + tblH + 0.2
    p.rect(SAFE_X0, y, CONTENT_W, 0.58, UCP.soft, { stroke: UCP.accent, strokePt: 0.9 })
    p.tx(0.9, y + 0.05, 11.5, 0.48, T('takeaway') + takeaway, 11.5, UCP.primary, UCP.soft, {
      bold: true,
      valign: 'middle',
    })
  }
  return STANDARD
}

function paintFlow(p: Painter, d: Extract<StudySlide, { module: 'flow_diagram' }>): Tier {
  const steps = d.steps ?? []
  const h = 4.6
  const y = 1.65
  const n = Math.max(steps.length, 1)
  const aw = 0.35
  const w = (CONTENT_W - aw * (n - 1)) / n
  steps.forEach((st, i) => {
    const x = SAFE_X0 + i * (w + aw)
    const hi = st.highlight === true
    const fill = hi ? UCP.primary : UCP.card
    const line = hi ? UCP.accent : UCP.border
    p.rect(x, y, w, h, fill, { stroke: line, strokePt: hi ? 1 : 0.6 })
    const badgeBg = hi ? UCP.accent : UCP.soft
    const badgeFg = hi ? inkOn(UCP.accent) : UCP.primary
    p.pill(
      x + 0.18,
      y + 0.18,
      0.8,
      0.28,
      (st.label || String(i + 1)).toUpperCase(),
      badgeBg,
      badgeFg,
      9,
    )
    const titleFg = hi ? UCP_TOKENS.on_primary : UCP.primary
    const descFg = hi ? UCP_TOKENS.subtitle_on_primary : UCP.text
    p.tx(x + 0.2, y + 0.58, w - 0.4, 0.5, st.title, 13.5, titleFg, fill, { bold: true })
    p.tx(x + 0.2, y + 1.15, w - 0.4, h - 1.4, st.desc, 11, descFg, fill, { lineSp: 1.1 })
    if (i < n - 1) {
      p.rect(x + w + 0.05, y + h / 2 - 0.12, aw - 0.1, 0.24, UCP.accent, {
        shape: 'rightArrow',
        rounded: false,
      })
    }
  })
  return STANDARD
}

function paintCase(p: Painter, d: Extract<StudySlide, { module: 'case_block' }>): Tier {
  const lw = 5.85
  const rx = 6.75
  const rw = 5.9
  const tw = lw - 0.4
  p.rect(SAFE_X0, SAFE_Y0, lw, 2.15, UCP.primary)
  p.tx(0.85, 1.7, tw, 0.25, T('vignette'), 9.5, UCP_TOKENS.on_primary, UCP.primary, { bold: true })
  p.tx(0.85, 1.98, tw, 1.6, d.case_stem, 11.5, UCP_TOKENS.on_primary, UCP.primary, { lineSp: 1.1 })
  p.rect(SAFE_X0, 3.85, lw, 2.65, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  p.tx(0.85, 4.0, tw, 0.3, T('findings'), 10, UCP_TOKENS.ink_accent, UCP.card, { bold: true })
  ;(d.findings ?? []).forEach((fdg, i) => {
    p.tx(0.85, 4.35 + i * 0.45, tw, 0.4, `• ${fdg}`, 11, UCP.text, UCP.card)
  })
  p.rect(rx, SAFE_Y0, rw, 2.15, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  p.tx(rx + 0.25, 1.7, rw - 0.5, 0.28, T('reasoning'), 10, UCP_TOKENS.ink_accent, UCP.card, {
    bold: true,
  })
  p.tx(rx + 0.25, 2.05, rw - 0.5, 1.5, d.reasoning, 10.8, UCP.text, UCP.card, { lineSp: 1.1 })
  p.rect(rx, 3.85, rw, 1.15, UCP.soft, { stroke: UCP.accent, strokePt: 0.9 })
  p.tx(rx + 0.25, 3.95, rw - 0.5, 0.28, T('diagnosis'), 9.5, UCP.alert, UCP.soft, { bold: true })
  p.tx(rx + 0.25, 4.25, rw - 0.5, 0.65, d.diagnosis, 12.5, UCP.primary, UCP.soft, { bold: true })
  p.rect(rx, 5.15, rw, 1.35, UCP.accent)
  const pearlFg = inkOn(UCP.accent)
  p.tx(rx + 0.25, 5.25, rw - 0.5, 0.28, T('pearl'), 9.5, pearlFg, UCP.accent, { bold: true })
  p.tx(rx + 0.25, 5.55, rw - 0.5, 0.85, d.clinical_pearl, 10.8, pearlFg, UCP.accent, {
    lineSp: 1.08,
  })
  return STANDARD
}

function paintGlossary(p: Painter, d: Extract<StudySlide, { module: 'glossary' }>): Tier {
  p.pill(10.55, 1.28, 2.1, 0.34, T('glossary'), UCP.soft, UCP.primary)
  const terms = d.terms ?? []
  const per = Math.max(Math.ceil(terms.length / 2), 1)
  const { rowH, yFirst } = stackLayout(2.05, 4.5, per, 0.12, 1.35)
  ;[terms.slice(0, per), terms.slice(per)].forEach((col, ci) => {
    const cx = SAFE_X0 + ci * 6.12
    col.forEach((e, j) => {
      const y = yFirst + j * (rowH + 0.12)
      p.tx(cx, y, 5.88, 0.3, e.term.toUpperCase(), 12, UCP.primary, UCP.bg, { bold: true })
      p.tx(cx, y + 0.34, 5.88, rowH - 0.38, e.def, 10.5, UCP.text, UCP.bg, { lineSp: 1.1 })
      if (j < col.length - 1)
        p.rect(cx, y + rowH - 0.02, 5.88, 0.012, UCP.border, { rounded: false })
    })
  })
  return STANDARD
}

function paintReading(p: Painter, d: Extract<StudySlide, { module: 'further_reading' }>): Tier {
  const entries = d.entries ?? []
  const n = Math.max(entries.length, 1)
  const { rowH, yFirst } = stackLayout(1.6, CONTENT_BAND_H, n, 0.14, 1.2)
  entries.forEach((e, i) => {
    const y = yFirst + i * (rowH + 0.14)
    p.rect(SAFE_X0, y, CONTENT_W, rowH, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    const tag = e.tag ?? ''
    const low = tag.toLowerCase()
    let fill: string = UCP.accent
    let fg: string = UCP_TOKENS.on_accent
    if (/(adv|avan)/.test(low)) {
      fill = UCP.alert
      fg = UCP_TOKENS.on_alert
    } else if (/(intro|bas|fund|esencial|essential|essencial)/.test(low)) {
      fill = UCP.success
      fg = UCP_TOKENS.on_success
    }
    p.pill(0.85, y + rowH / 2 - 0.17, 2.0, 0.34, tag.toUpperCase(), fill, fg)
    p.tx(3.1, y + 0.1, 9.3, 0.35, e.title, 12, UCP.primary, UCP.card, { bold: true })
    if (e.note)
      p.tx(3.1, y + 0.52, 9.3, rowH - 0.6, e.note, 10.5, UCP.text, UCP.card, { lineSp: 1.08 })
  })
  return STANDARD
}

function paintCycle(p: Painter, d: Extract<StudySlide, { module: 'cycle_diagram' }>): Tier {
  const nodes = d.nodes ?? []
  const n = Math.max(nodes.length, 1)
  const cardW = 2.4
  const cardH = 1.15
  const cx = 6.666
  const cy = (SAFE_Y0 + CONTENT_BOTTOM) / 2
  const R = Math.min(2.3, (CONTENT_BAND_H / 2 - cardH / 2) / 0.82)
  const centers: [number, number][] = []
  for (let i = 0; i < n; i += 1) {
    const rad = ((-90 + i * (360 / n)) * Math.PI) / 180
    centers.push([cx + R * Math.cos(rad), cy + R * Math.sin(rad) * 0.82])
  }
  for (let i = 0; i < n; i += 1) {
    const [x1, y1] = centers[i]!
    const [x2, y2] = centers[(i + 1) % n]!
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    p.rect(mx - 0.08, my - 0.08, 0.16, 0.16, UCP.accent, { shape: 'ellipse' })
  }
  centers.forEach(([cxx, cyy], i) => {
    const nd = nodes[i]!
    const hi = Boolean(nd.highlight)
    const fill = hi ? UCP.primary : UCP.card
    p.rect(cxx - cardW / 2, cyy - cardH / 2, cardW, cardH, fill, {
      stroke: hi ? UCP.accent : UCP.border,
      strokePt: hi ? 1 : 0.6,
    })
    p.tx(
      cxx - cardW / 2 + 0.12,
      cyy - cardH / 2 + 0.1,
      cardW - 0.24,
      0.38,
      nd.title,
      11.5,
      hi ? UCP_TOKENS.on_primary : UCP.primary,
      fill,
      { bold: true, align: 'center' },
    )
    if (nd.desc) {
      p.tx(
        cxx - cardW / 2 + 0.12,
        cyy - cardH / 2 + 0.48,
        cardW - 0.24,
        0.55,
        nd.desc,
        10.5,
        hi ? UCP_TOKENS.subtitle_on_primary : UCP.text,
        fill,
        { align: 'center', lineSp: 1.05 },
      )
    }
  })
  if (d.center_label) {
    p.rect(cx - 0.85, cy - 0.35, 1.7, 0.7, UCP.soft, { stroke: UCP.accent, strokePt: 0.9 })
    p.tx(cx - 0.75, cy - 0.35, 1.5, 0.7, d.center_label, 10, UCP.primary, UCP.soft, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
  }
  paintFootnote(p, d)
  return STANDARD
}

function paintQuadrant(p: Painter, d: Extract<StudySlide, { module: 'quadrant_matrix' }>): Tier {
  const quads = d.quadrants ?? []
  const x0 = 1.2
  const y0 = SAFE_Y0
  const qw = 5.64
  const qh = 2.35
  const gap = 0.12
  if (d.y_label) {
    p.tx(0.66, y0, 0.5, 2 * qh + gap, d.y_label.toUpperCase(), 10, UCP.text_muted, UCP.bg, {
      bold: true,
      align: 'center',
    })
  }
  if (d.x_label) {
    p.tx(
      x0,
      y0 + 2 * qh + gap + 0.03,
      2 * qw + gap,
      0.22,
      d.x_label.toUpperCase(),
      10,
      UCP.text_muted,
      UCP.bg,
      { align: 'center', bold: true },
    )
  }
  const coords: [number, number][] = [
    [x0, y0],
    [x0 + qw + gap, y0],
    [x0, y0 + qh + gap],
    [x0 + qw + gap, y0 + qh + gap],
  ]
  const accents = [UCP.primary, UCP.accent, UCP.accent, UCP.primary]
  coords.forEach(([qx, qy], i) => {
    const q = quads[i] ?? { title: '', points: [] }
    p.rect(qx, qy, qw, qh, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(qx, qy, qw, 0.05, accents[i]!, { rounded: false })
    p.tx(qx + 0.2, qy + 0.15, qw - 0.4, 0.4, q.title, 13, UCP.primary, UCP.card, { bold: true })
    ;(q.points ?? []).forEach((pt, j) => {
      p.tx(qx + 0.2, qy + 0.6 + j * 0.32, qw - 0.4, 0.3, `• ${pt}`, 10.5, UCP.text, UCP.card, {
        lineSp: 1.08,
      })
    })
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintPyramid(p: Painter, d: Extract<StudySlide, { module: 'pyramid' }>): Tier {
  const levels = d.levels ?? []
  const n = Math.max(levels.length, 1)
  const baseW = 8.2
  const cx = 6.666
  const lh = Math.min(0.95, 4.6 / n)
  const stackH = n * lh + 0.08 * (n - 1)
  const top0 = SAFE_Y0 + (CONTENT_BAND_H - stackH) / 2
  levels.forEach((lv, i) => {
    const w = (baseW * (i + 1)) / n
    const ly = top0 + stackH - (i + 1) * lh - 0.08 * i
    const hi = Boolean(lv.highlight)
    const fill = hi ? UCP.primary : UCP.card
    p.rect(cx - w / 2, ly, w, lh, fill, {
      stroke: hi ? UCP.accent : UCP.border,
      strokePt: hi ? 0.8 : 0.6,
    })
    p.tx(
      cx - w / 2 + 0.25,
      ly,
      w - 0.5,
      lh,
      lv.title,
      12,
      hi ? UCP_TOKENS.on_primary : UCP.primary,
      fill,
      { bold: true, align: 'center', valign: 'middle' },
    )
    if (lv.desc) {
      p.tx(cx + baseW / 2 + 0.25, ly, 1.6, lh, lv.desc, 10.5, UCP.text_muted, UCP.bg, {
        valign: 'middle',
        lineSp: 1.05,
      })
    }
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintVennItems(
  p: Painter,
  cx: number,
  cy: number,
  w: number,
  h: number,
  items: string[],
  size: number,
): void {
  items.forEach((it, i) => {
    const row = h / Math.max(items.length, 1)
    p.tx(cx - w / 2, cy - h / 2 + i * row, w, row, `• ${it}`, size, UCP.text, UCP.bg, {
      align: 'center',
      valign: 'middle',
      lineSp: 1.08,
    })
  })
}

function paintVenn(p: Painter, d: Extract<StudySlide, { module: 'venn_diagram' }>): Tier {
  const sets = d.sets ?? []
  const shared = d.shared ?? []
  const ink = UCP_TOKENS.ink_accent
  const n = sets.length
  const label = (cx: number, y: number, text: string) => {
    p.tx(cx - 1.2, y, 2.4, 0.32, String(text).toUpperCase(), 11, UCP.primary, UCP.bg, {
      bold: true,
      align: 'center',
    })
  }
  const circle = (cx: number, cy: number, r: number, color: string) => {
    p.rect(cx - r, cy - r, 2 * r, 2 * r, color, { shape: 'ellipse', stroke: UCP.border, strokePt: 1.25 })
  }
  if (n === 3) {
    const top: [number, number] = [6.666, 3.04]
    const low: [number, number] = [5.346, 4.14]
    const right: [number, number] = [7.986, 4.14]
    circle(top[0], top[1], 1.49, UCP.primary)
    circle(low[0], low[1], 1.49, UCP.accent)
    circle(right[0], right[1], 1.49, UCP.primary)
    label(top[0], 1.6, sets[0]?.label ?? '')
    label(low[0], 5.2, sets[1]?.label ?? '')
    label(right[0], 5.2, sets[2]?.label ?? '')
    paintVennItems(p, top[0], 2.7, 1.65, 1.5, sets[0]?.items ?? [], 10.5)
    paintVennItems(p, low[0], 4.35, 1.65, 1.5, sets[1]?.items ?? [], 10.5)
    paintVennItems(p, right[0], 4.35, 1.65, 1.5, sets[2]?.items ?? [], 10.5)
    if (shared.length) {
      p.rect(SAFE_X0 + 0.7, 5.75, 10.0, 0.9, UCP.soft, { stroke: UCP.border, strokePt: 0.5 })
      p.tx(1.75, 5.82, 1.6, 0.24, T('shared'), 9.5, ink, UCP.soft, { bold: true })
      paintVennItems(p, 7.4, 6.2, 6.4, 0.7, shared, 10.5)
    }
  } else {
    circle(5.55, 4.1, 1.85, UCP.primary)
    circle(7.78, 4.1, 1.85, UCP.accent)
    label(5.55, 1.95, sets[0]?.label ?? '')
    label(7.78, 1.95, sets[1]?.label ?? '')
    paintVennItems(p, 4.6, 4.1, 1.8, 2.0, sets[0]?.items ?? [], 10.5)
    paintVennItems(p, 8.73, 4.1, 1.8, 2.0, sets[1]?.items ?? [], 10.5)
    p.rect(6.665 - 1.45 / 2 - 0.05, 4.1 - 2.1 / 2 - 0.05, 1.45 + 0.1, 2.1 + 0.1, UCP.card)
    paintVennItems(p, 6.665, 4.1, 1.45, 2.1, shared, 10.5)
  }
  paintFootnote(p, d)
  return STANDARD
}

function paintConcept(p: Painter, d: Extract<StudySlide, { module: 'concept_map' }>): Tier {
  const nodes = d.nodes ?? []
  const n = Math.max(nodes.length, 1)
  const cx = 6.666
  const cy = 4.05
  const rx = 3.9
  const ry = 2.0
  const cardW = 2.5
  const cardH = 1.05
  const centers: [number, number][] = []
  for (let i = 0; i < n; i += 1) {
    const ang = ((-90 + i * (360 / n)) * Math.PI) / 180
    centers.push([cx + rx * Math.cos(ang), cy + ry * Math.sin(ang)])
  }
  p.rect(cx - 1.25, cy - 0.5, 2.5, 1.0, UCP.primary)
  p.tx(cx - 1.15, cy - 0.5, 2.3, 1.0, d.hub, 13, UCP_TOKENS.on_primary, UCP.primary, {
    bold: true,
    align: 'center',
    valign: 'middle',
  })
  centers.forEach(([nx, ny], i) => {
    const nd = nodes[i] ?? { title: '' }
    const hi = Boolean(nd.highlight)
    const px = Math.min(Math.max(nx - cardW / 2, SAFE_X0), CANVAS_W - SAFE_X0 - cardW)
    const py = ny - cardH / 2
    const fill = hi ? UCP.primary : UCP.card
    p.rect(px, py, cardW, cardH, fill, {
      stroke: hi ? UCP.accent : UCP.border,
      strokePt: hi ? 1 : 0.6,
    })
    p.tx(
      px + 0.15,
      py + 0.08,
      cardW - 0.3,
      0.38,
      nd.title,
      11.5,
      hi ? UCP_TOKENS.on_primary : UCP.primary,
      fill,
      { bold: true, align: 'center' },
    )
    if (nd.desc) {
      p.tx(
        px + 0.15,
        py + 0.48,
        cardW - 0.3,
        0.48,
        nd.desc,
        10.5,
        hi ? UCP_TOKENS.subtitle_on_primary : UCP.text,
        fill,
        { align: 'center', lineSp: 1.05 },
      )
    }
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintChart(p: Painter, d: Extract<StudySlide, { module: 'chart_data' }>): Tier {
  const cats = d.categories ?? []
  const series = d.series ?? []
  const insights = d.insights ?? []
  const ink = UCP_TOKENS.ink_accent
  const plotX = SAFE_X0
  const plotY = 1.6
  const plotW = 8.1
  const plotH = 4.85
  p.rect(plotX, plotY, plotW, plotH, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  const maxV = Math.max(
    1,
    ...series.flatMap((s) => s.values ?? []).filter((v) => typeof v === 'number'),
  )
  const n = Math.max(cats.length, 1)
  const sn = Math.max(series.length, 1)
  const groupW = (plotW - 0.6) / n
  const barW = Math.min(0.42, (groupW * 0.7) / sn)
  const baseY = plotY + plotH - 0.55
  const usable = plotH - 1.0
  cats.forEach((cat, i) => {
    const gx = plotX + 0.3 + i * groupW
    series.forEach((sr, si) => {
      const v = Number(sr.values?.[i] ?? 0)
      const bh = (Math.max(v, 0) / maxV) * usable
      const bx = gx + (groupW - barW * sn) / 2 + si * barW
      p.rect(bx, baseY - bh, barW - 0.04, Math.max(bh, 0.04), si === 0 ? UCP.primary : UCP.accent, {
        rounded: false,
      })
    })
    p.tx(gx, baseY + 0.08, groupW, 0.32, cat, 10, UCP.text, UCP.card, { align: 'center' })
  })
  if (sn > 1) {
    series.forEach((sr, si) => {
      p.tx(
        plotX + 0.3 + si * 2.4,
        plotY + 0.12,
        2.2,
        0.28,
        sr.name,
        10,
        si === 0 ? UCP.primary : UCP.accent,
        UCP.card,
        { bold: true },
      )
    })
  }
  p.rect(9.0, 1.6, 3.65, 4.85, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  p.rect(9.0, 1.6, 3.65, 0.05, UCP.accent, { rounded: false })
  p.tx(9.25, 1.78, 3.15, 0.3, T('reading'), 10, ink, UCP.card, { bold: true })
  insights.forEach((ins, i) => {
    p.tx(9.25, 2.2 + i * 0.95, 3.15, 0.9, `• ${ins}`, 10.8, UCP.text, UCP.card, { lineSp: 1.12 })
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintQuote(p: Painter, d: Extract<StudySlide, { module: 'quote_block' }>): Tier {
  p.tx(1.0, 1.45, 1.15, 1.3, '\u201C', 88, UCP.accent, UCP.bg, { bold: true })
  p.tx(2.2, 1.9, 9.4, 2.3, d.quote, 20, UCP.text, UCP.bg, {
    italic: true,
    align: 'center',
    lineSp: 1.25,
  })
  p.rect(5.87, 4.45, 1.6, 0.03, UCP.accent, { rounded: false })
  p.tx(2.2, 4.65, 9.4, 0.35, `— ${(d.author ?? '').toUpperCase()}`, 13, UCP.primary, UCP.bg, {
    bold: true,
    align: 'center',
  })
  const src = [d.source, d.year].filter(Boolean).join(' · ')
  if (src) {
    p.tx(2.2, 5.02, 9.4, 0.3, src, 10.5, UCP.text_muted, UCP.bg, { italic: true, align: 'center' })
  }
  if (d.context) {
    p.rect(2.2, 5.55, 9.4, 0.8, UCP.soft, { stroke: UCP.border, strokePt: 0.4 })
    p.tx(2.45, 5.66, 8.9, 0.6, d.context, 10.5, UCP.text, UCP.soft, { align: 'center', lineSp: 1.1 })
  }
  paintFootnote(p, d)
  return STANDARD
}

function paintSocratic(p: Painter, d: Extract<StudySlide, { module: 'socratic_question' }>): Tier {
  const ink = UCP_TOKENS.ink_accent
  p.rect(0.75, 1.8, 1.5, 1.5, UCP.primary, { shape: 'ellipse', stroke: UCP.accent, strokePt: 1.5 })
  p.tx(0.75, 1.8, 1.5, 1.5, '?', 44, UCP_TOKENS.on_primary, UCP.primary, {
    bold: true,
    align: 'center',
    valign: 'middle',
  })
  p.tx(2.55, 1.75, 9.9, 0.3, T('tutorial'), 10, ink, UCP.bg, { bold: true })
  p.tx(2.55, 2.1, 9.9, 1.6, d.question, 20, UCP.primary, UCP.bg, { italic: true, lineSp: 1.2 })
  if (d.context) {
    p.tx(2.55, 3.75, 9.9, 0.45, d.context, 10.5, UCP.text_muted, UCP.bg, { lineSp: 1.15 })
  }
  const sc = d.scaffold ?? []
  const n = sc.length
  if (n) {
    const gap = 0.25
    const { itemW: w, x0: sx } = rowLayout(SAFE_X0, CONTENT_W, n, gap)
    sc.forEach((s, i) => {
      const x = sx + i * (w + gap)
      p.rect(x, 4.35, w, 1.75, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
      p.rect(x, 4.35, w, 0.05, UCP.accent, { rounded: false })
      p.rect(x + 0.18, 4.55, 0.4, 0.4, UCP.primary, { shape: 'ellipse' })
      p.tx(x + 0.18, 4.55, 0.4, 0.4, String(i + 1), 12, UCP_TOKENS.on_primary, UCP.primary, {
        bold: true,
        align: 'center',
        valign: 'middle',
      })
      p.tx(x + 0.7, 4.55, w - 0.9, 1.4, s, 10.8, UCP.text, UCP.card, { lineSp: 1.12 })
    })
  }
  if (d.reading) {
    p.tx(SAFE_X0, 6.3, CONTENT_W, 0.3, d.reading, 10.5, UCP.text_muted, UCP.bg, { italic: true })
  }
  paintFootnote(p, d)
  return STANDARD
}

function paintOxford(p: Painter, d: Extract<StudySlide, { module: 'oxford_union' }>): Tier {
  p.rect(SAFE_X0, 1.5, CONTENT_W, 1.15, UCP.primary)
  p.tx(0.95, 1.62, 11.4, 0.28, T('house'), 9.5, UCP_TOKENS.on_primary, UCP.primary, { bold: true })
  p.tx(0.95, 1.92, 11.4, 0.68, `"${d.motion ?? ''}"`, 17, UCP_TOKENS.on_primary, UCP.primary, {
    bold: true,
    lineSp: 1.05,
  })
  const sides: [number, 'pro_card' | 'con_card', string][] = [
    [SAFE_X0, 'pro_card', UCP.primary],
    [6.77, 'con_card', UCP.accent],
  ]
  for (const [x, key, bar] of sides) {
    const card = d[key] ?? {}
    p.rect(x, 2.9, 5.88, 2.95, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(x, 2.9, 5.88, 0.44, bar, { rounded: false })
    p.tx(x + 0.25, 2.97, 5.38, 0.32, (card.title ?? '').toUpperCase(), 10.5, inkOn(bar), bar, {
      bold: true,
    })
    ;(card.points ?? []).forEach((pt, i) => {
      p.tx(x + 0.25, 3.5 + i * 0.5, 5.38, 0.48, `• ${pt}`, 11, UCP.text, UCP.card, { lineSp: 1.1 })
    })
  }
  p.rect(SAFE_X0, 6.05, CONTENT_W, 0.55, UCP.soft, { stroke: UCP.accent, strokePt: 0.9 })
  p.tx(0.9, 6.09, 11.5, 0.48, `${T('verdict')} ${d.verdict ?? ''}`, 11, UCP.primary, UCP.soft, {
    bold: true,
    valign: 'middle',
  })
  paintFootnote(p, d, 6.66)
  return STANDARD
}

function paintEvidence(p: Painter, d: Extract<StudySlide, { module: 'evidence_card' }>): Tier {
  p.rect(SAFE_X0, 1.5, CONTENT_W, 0.95, UCP.primary)
  p.tx(0.95, 1.62, 9.0, 0.42, d.study_name, 17, UCP_TOKENS.on_primary, UCP.primary, { bold: true })
  if (d.year) {
    p.rect(10.85, 1.64, 1.5, 0.38, UCP.accent)
    p.tx(10.85, 1.64, 1.5, 0.38, String(d.year), 11, inkOn(UCP.accent), UCP.accent, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
  }
  p.tx(0.95, 2.06, 9.6, 0.3, (d.design ?? '').toUpperCase(), 9.5, UCP_TOKENS.on_primary_soft, UCP.primary, {
    bold: true,
  })
  const rows = (
    [
      ['P', 'population'],
      ['I', 'intervention'],
      ['C', 'comparison'],
      ['O', 'outcome'],
    ] as const
  ).filter(([, f]) => Boolean(d[f]))
  const rh = 0.85
  const gp = 0.12
  rows.forEach(([ltr, f], i) => {
    const y = 2.65 + i * (rh + gp)
    p.rect(SAFE_X0, y, 0.55, 0.55, UCP.primary)
    p.tx(SAFE_X0, y, 0.55, 0.55, ltr, 15, UCP_TOKENS.on_primary, UCP.primary, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
    p.tx(1.35, y, 6.5, rh, String(d[f] ?? ''), 11, UCP.text, UCP.bg, { lineSp: 1.1 })
  })
  p.rect(8.15, 2.65, 4.5, 1.7, UCP.accent)
  const heroFg = inkOn(UCP.accent)
  p.tx(8.3, 2.82, 4.2, 0.9, d.effect, 36, heroFg, UCP.accent, { bold: true, align: 'center' })
  if (d.effect_desc) {
    p.tx(8.35, 3.78, 4.1, 0.45, d.effect_desc, 10.5, heroFg, UCP.accent, {
      align: 'center',
      lineSp: 1.05,
    })
  }
  if (d.limitation) {
    p.rect(8.15, 4.55, 4.5, 1.85, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(8.15, 4.55, 0.06, 1.85, UCP.alert, { rounded: false })
    p.tx(8.4, 4.7, 4.0, 0.28, T('limitation'), 9, UCP.alert, UCP.card, { bold: true })
    p.tx(8.4, 5.0, 4.0, 1.3, d.limitation, 10.5, UCP.text, UCP.card, { lineSp: 1.1 })
  }
  paintFootnote(p, d, CONTENT_BOTTOM)
  return STANDARD
}

function paintViva(p: Painter, d: Extract<StudySlide, { module: 'viva_question' }>): Tier {
  const ink = UCP_TOKENS.ink_accent
  p.rect(SAFE_X0, SAFE_Y0, 5.7, CONTENT_BAND_H, UCP.primary)
  p.tx(0.95, 1.75, 5.1, 0.3, T('viva'), 10, UCP_TOKENS.on_primary, UCP.primary, { bold: true })
  if (d.difficulty) {
    p.pill(0.95, 2.13, 1.7, 0.34, d.difficulty.toUpperCase(), UCP.accent, inkOn(UCP.accent))
  }
  p.tx(0.95, 2.65, 5.1, 3.6, d.prompt, 16, UCP_TOKENS.on_primary, UCP.primary, { lineSp: 1.2 })
  p.rect(6.55, SAFE_Y0, 6.1, 2.75, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  p.tx(6.8, 1.72, 5.6, 0.3, T('model_answer'), 10, ink, UCP.card, { bold: true })
  p.tx(6.8, 2.12, 5.6, 2.0, d.model_answer, 11.5, UCP.text, UCP.card, { lineSp: 1.12 })
  p.rect(6.55, 4.5, 6.1, 2.0, UCP.soft, { stroke: UCP.border, strokePt: 0.6 })
  p.rect(6.55, 4.5, 0.06, 2.0, UCP.alert, { rounded: false })
  p.tx(6.8, 4.65, 5.6, 0.3, T('examiner'), 10, UCP.alert, UCP.soft, { bold: true })
  p.tx(6.8, 5.02, 5.6, 1.35, d.examiner_note, 10.8, UCP.text, UCP.soft, { lineSp: 1.1 })
  paintFootnote(p, d)
  return STANDARD
}

function paintMnemonic(p: Painter, d: Extract<StudySlide, { module: 'mnemonic_card' }>): Tier {
  const ink = UCP_TOKENS.ink_accent
  const acr = d.acronym ?? ''
  const exp = d.expansion ?? []
  const n = Math.max(acr.length, 1)
  const gap = 0.15
  const cw = Math.min(1.35, (CONTENT_W - gap * (n - 1)) / n)
  const total = cw * n + gap * (n - 1)
  const x0 = SAFE_X0 + (CONTENT_W - total) / 2
  if (d.domain) p.pill(10.3, 1.28, 2.35, 0.34, d.domain.toUpperCase(), UCP.soft, UCP.primary)
  ;[...acr].forEach((ch, i) => {
    const x = x0 + i * (cw + gap)
    p.rect(x, 1.95, cw, 0.95, UCP.primary)
    p.tx(x, 1.95, cw, 0.95, ch.toUpperCase(), 28, UCP_TOKENS.on_primary, UCP.primary, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
    p.tx(x - 0.075, 3.0, cw + 0.15, 0.8, exp[i] ?? '', 9.5, UCP.text, UCP.bg, {
      align: 'center',
      lineSp: 1.05,
    })
  })
  p.rect(SAFE_X0, 4.1, CONTENT_W, 1.7, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
  p.rect(SAFE_X0, 4.1, CONTENT_W, 0.05, UCP.accent, { rounded: false })
  p.tx(0.95, 4.28, 11.4, 0.3, T('clinical_use'), 10, ink, UCP.card, { bold: true })
  p.tx(0.95, 4.62, 11.4, 1.05, d.usage, 12, UCP.text, UCP.card, { lineSp: 1.15 })
  paintFootnote(p, d)
  return STANDARD
}

function paintEtymology(p: Painter, d: Extract<StudySlide, { module: 'etymology' }>): Tier {
  const roots = d.roots ?? []
  const frags = d.fragments ?? []
  const ink = UCP_TOKENS.ink_accent
  const parts = frags.length === roots.length && frags.length ? frags : [d.term]
  const pw = CONTENT_W / Math.max(parts.length, 1)
  parts.forEach((fr, i) => {
    const col = parts.length > 1 ? (i % 2 === 0 ? UCP.primary : ink) : UCP.primary
    p.tx(SAFE_X0 + i * pw, 1.85, pw, 1.25, fr, 40, col, UCP.bg, { bold: true, align: 'center' })
  })
  p.rect(5.87, 3.2, 1.6, 0.03, UCP.accent, { rounded: false })
  const n = Math.max(roots.length, 1)
  const gap = 0.3
  const { itemW: w, x0: sx } = rowLayout(SAFE_X0, CONTENT_W, n, gap)
  roots.forEach((rt, i) => {
    const x = sx + i * (w + gap)
    p.rect(x, 3.5, w, 1.85, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(x, 3.5, w, 0.05, UCP.accent, { rounded: false })
    p.tx(x + 0.2, 3.68, w - 0.4, 0.4, rt.part, 15, UCP.primary, UCP.card, {
      bold: true,
      align: 'center',
    })
    p.tx(
      x + 0.2,
      4.1,
      w - 0.4,
      0.3,
      `${T('origin')} · ${(rt.origin ?? '').toUpperCase()}`,
      9,
      ink,
      UCP.card,
      { bold: true, align: 'center' },
    )
    p.tx(x + 0.2, 4.45, w - 0.4, ROOT_CARD_TEXT_H - 0.9, rt.meaning ?? '', 10.5, UCP.text, UCP.card, {
      align: 'center',
      lineSp: 1.1,
    })
  })
  p.rect(SAFE_X0, 5.6, CONTENT_W, 0.8, UCP.soft, { stroke: UCP.border, strokePt: 0.4 })
  p.tx(0.9, 5.68, 11.5, 0.28, T('modern_use'), 9.5, ink, UCP.soft, { bold: true })
  p.tx(0.9, 5.96, 11.5, 0.38, d.modern, 11.5, UCP.primary, UCP.soft, { bold: true })
  paintFootnote(p, d)
  return STANDARD
}

function paintRefs(p: Painter, d: Extract<StudySlide, { module: 'references' }>): Tier {
  const refs = d.refs ?? []
  const ink = UCP_TOKENS.ink_accent
  const n = refs.length
  p.pill(10.85, 1.28, 1.8, 0.34, `${T('references')} · ${n}`, UCP.soft, UCP.primary)
  const per = Math.max(Math.ceil(n / 2), 1)
  ;[refs.slice(0, per), refs.slice(per)].forEach((col, ci) => {
    const cx = SAFE_X0 + ci * 6.15
    col.forEach((ref, j) => {
      const y = 2.05 + j * 0.92
      p.tx(cx, y, 0.45, 0.35, `${ci * per + j + 1}.`, 12, ink, UCP.bg, { bold: true })
      p.tx(cx + 0.5, y, 5.35, 0.82, ref, 10.5, UCP.text, UCP.bg, { lineSp: 1.1 })
    })
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintAuthority(p: Painter, d: Extract<StudySlide, { module: 'authority_card' }>): Tier {
  const ink = UCP_TOKENS.ink_accent
  p.placeImage(SAFE_X0 + 0.04, SAFE_Y0, 3.7, CONTENT_BAND_H, d.image)
  const name = d.name ?? ''
  const w = 7.8
  const nameH = blockHeight(name, w, 24, 0.9, tierForBlock(name, w, 24, 0.9))
  p.tx(4.75, 1.7, w, nameH, name, 24, UCP.primary, UCP.bg, { bold: true })
  let y = 1.7 + nameH + 0.08
  if (d.dates) {
    p.tx(4.75, y, w, 0.3, d.dates, 11, ink, UCP.bg, { bold: true })
    y += 0.34
  }
  if (d.epithet) {
    p.tx(4.75, y, w, 0.35, d.epithet, 11.5, UCP.text_muted, UCP.bg, { italic: true })
    y += 0.42
  }
  p.tx(4.75, y, w, 2.4, d.bio, 11.5, UCP.text, UCP.bg, { lineSp: 1.18 })
  if (d.legacy) {
    p.rect(4.75, 5.75, w, 0.75, UCP.soft, { stroke: UCP.border, strokePt: 0.5 })
    p.rect(4.75, 5.75, 0.06, 0.75, UCP.accent, { rounded: false })
    p.tx(5.0, 5.83, w - 0.5, 0.28, T('legacy'), 9, ink, UCP.soft, { bold: true })
    p.tx(5.0, 6.1, w - 0.5, 0.35, d.legacy, 10.5, UCP.primary, UCP.soft, { bold: true })
  }
  paintFootnote(p, d)
  return STANDARD
}

function paintColloquy(p: Painter, d: Extract<StudySlide, { module: 'colloquy' }>): Tier {
  const turns = d.turns ?? []
  const n = Math.max(turns.length, 1)
  const gap = 0.12
  const { rowH: th, yFirst } = stackLayout(SAFE_Y0, CONTENT_H, n, gap, 1.15)
  turns.forEach((t, i) => {
    const y = yFirst + i * (th + gap)
    const isTutor = String(t.speaker ?? 'tutor').toLowerCase() === 'tutor'
    const letter = (isTutor ? T('tutor') : T('student'))[0] ?? '?'
    const avX = isTutor ? SAFE_X0 : 12.26
    const avFill = isTutor ? UCP.primary : UCP.accent
    p.rect(avX, y + th / 2 - 0.21, 0.42, 0.42, avFill, { shape: 'ellipse' })
    p.tx(avX, y + th / 2 - 0.21, 0.42, 0.42, letter, 12, inkOn(avFill), avFill, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
    const bx = isTutor ? 1.25 : 4.3
    const bw = 7.8
    p.rect(bx, y, bw, th, avFill, isTutor ? undefined : { stroke: UCP.border, strokePt: 0.6 })
    p.tx(bx + 0.25, y, bw - 0.5, th, t.text, 10.8, inkOn(avFill), avFill, {
      valign: 'middle',
      lineSp: 1.12,
    })
  })
  paintFootnote(p, d)
  return STANDARD
}

function paintPassage(p: Painter, d: Extract<StudySlide, { module: 'annotated_passage' }>): Tier {
  const ink = UCP_TOKENS.ink_accent
  p.rect(SAFE_X0, SAFE_Y0, 7.3, CONTENT_BAND_H, UCP.soft, { stroke: UCP.border, strokePt: 0.5 })
  p.tx(0.95, 1.75, 6.7, 4.15, d.passage, 13, UCP.text, UCP.soft, { italic: true, lineSp: 1.25 })
  if (d.source) {
    p.rect(0.95, 6.0, 1.2, 0.025, UCP.accent, { rounded: false })
    p.tx(0.95, 6.08, 6.7, 0.3, `— ${d.source}`, 10.5, UCP.text_muted, UCP.soft, { italic: true })
  }
  p.tx(8.25, 1.28, 4.4, 0.3, T('marginalia'), 9.5, ink, UCP.bg, { bold: true })
  const anns = d.annotations ?? []
  const gap = 0.12
  const { rowH: ah, yFirst } = stackLayout(2.0, 4.55, Math.max(anns.length, 1), gap, 1.05)
  anns.forEach((a, i) => {
    const y = yFirst + i * (ah + gap)
    p.rect(8.25, y, 4.4, ah, UCP.card, { stroke: UCP.border, strokePt: 0.6 })
    p.rect(8.25, y, 0.5, 0.5, UCP.accent)
    p.tx(8.25, y, 0.5, 0.5, String(a.ref ?? i + 1), 11, inkOn(UCP.accent), UCP.accent, {
      bold: true,
      align: 'center',
      valign: 'middle',
    })
    p.tx(8.9, y + 0.06, 3.65, ah - 0.12, a.note, 10.5, UCP.text, UCP.card, {
      valign: 'middle',
      lineSp: 1.1,
    })
  })
  paintFootnote(p, d)
  return STANDARD
}
