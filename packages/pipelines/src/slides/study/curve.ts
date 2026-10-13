/** Pedagogical curve from outline.md. ADR-S5: study `when`, not marketing layouts. */
import { LAYOUT_VARIANTS, PAGE_TYPES } from '../outline'
import { listStudyModules } from './schema'
import type { StudySlide } from './types'

export interface StudyCurveSection {
  heading: string
  blocks: string[]
}

export interface StudyCurve {
  title: string
  sections: StudyCurveSection[]
  when: { module: StudySlide['module']; when: string }[]
}

const MARKETING_LAYOUTS = new Set(Object.values(LAYOUT_VARIANTS).flat())

export function parseStudyCurve(markdown: string): StudyCurve {
  const lines = markdown.split(/\r?\n/)
  let title = 'OUTLINE'
  const sections: StudyCurveSection[] = []
  let current: StudyCurveSection | null = null
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      title = line.slice(2).trim()
      continue
    }
    if (line.startsWith('## ')) {
      current = { heading: line.slice(3).trim(), blocks: [] }
      sections.push(current)
      continue
    }
    const bullet = line.replace(/^[-*]\s+/, '')
    if (current) current.blocks.push(bullet)
  }
  return { title, sections, when: listStudyModules() }
}

export function marketingHits(value: unknown): string[] {
  const hits: string[] = []
  walk(value, hits)
  return hits
}

function walk(value: unknown, hits: string[]): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    for (const item of value) walk(item, hits)
    return
  }
  const rec = value as Record<string, unknown>
  if (typeof rec.layout === 'string' && MARKETING_LAYOUTS.has(rec.layout)) {
    hits.push(`marketing layout: ${rec.layout}`)
  }
  if (typeof rec.type === 'string' && (PAGE_TYPES as readonly string[]).includes(rec.type)) {
    hits.push(`marketing page type: ${rec.type}`)
  }
  for (const v of Object.values(rec)) walk(v, hits)
}
