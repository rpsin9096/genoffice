import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileDeck } from '../src/slides/study/compile'
import { allowedPaintHexes, UCP, UCP_TOKENS } from '../src/slides/study/palette-ucp'
import { INFLAMACAO_MANIFEST } from './fixtures/inflamacao'

const HEX_LIT = /['"]#?([0-9A-Fa-f]{6})['"]/g
const PAINTERS = ['modules.ts', 'painter.ts', 'compile.ts', 'images.ts']

function hexesIn(src: string): string[] {
  return [...src.matchAll(HEX_LIT)].map((m) => m[1]!.toUpperCase())
}

function paintHexes(page: { elements: readonly Record<string, unknown>[] }): string[] {
  const out: string[] = []
  const take = (v: unknown) => {
    if (typeof v === 'string' && /^#?[0-9A-Fa-f]{6}$/.test(v)) {
      out.push(v.replace(/^#/, '').toUpperCase())
    }
  }
  for (const el of page.elements) {
    take(el.fill)
    const stroke = el.stroke as { color?: string } | undefined
    take(stroke?.color)
    const paragraphs = el.paragraphs as { runs?: { color?: string }[] }[] | undefined
    for (const p of paragraphs ?? []) {
      for (const r of p.runs ?? []) take(r.color)
    }
  }
  return out
}

describe('UCP tokens (3.zip palette.py — no loose hex)', () => {
  it('keeps the 3.zip brand slots', () => {
    expect(UCP).toMatchObject({
      primary: '3854CC',
      accent: 'D92A2B',
      bg: 'F8F9FF',
      text: '2B2C4A',
      text_muted: '606383',
      alert: 'B91C1C',
      success: '1E8A5A',
      border: 'D9DDF2',
      card: 'FFFFFF',
      soft: 'EEF0FF',
      highlight: 'E0E4FF',
    })
  })

  it('derives the WCAG text tokens', () => {
    for (const name of [
      'ink_accent',
      'on_primary',
      'on_primary_soft',
      'subtitle_on_primary',
      'on_accent',
      'on_success',
      'on_alert',
      'ink_success',
    ] as const) {
      expect(UCP_TOKENS[name], name).toMatch(/^[0-9A-Fa-f]{6}$/)
    }
  })

  it('does not hard-code hex in the painter or modules', () => {
    const dir = resolve(__dirname, '../src/slides/study')
    const offenders: string[] = []
    for (const name of PAINTERS) {
      const hits = hexesIn(readFileSync(join(dir, name), 'utf-8'))
      for (const h of hits) offenders.push(`${name}:${h}`)
    }
    expect(offenders, offenders.join(', ')).toEqual([])
  })

  it('paints inflamacao only with UCP + derived tokens', () => {
    const allowed = allowedPaintHexes()
    const stray: string[] = []
    for (const { page, module } of compileDeck(INFLAMACAO_MANIFEST)) {
      for (const hex of paintHexes(page)) {
        if (!allowed.has(hex)) stray.push(`${module}:${hex}`)
      }
    }
    expect(stray, stray.join(', ')).toEqual([])
  })

  it('lists palette-ucp.ts as the only study source of brand hex', () => {
    const dir = resolve(__dirname, '../src/slides/study')
    const others = readdirSync(dir)
      .filter((n) => n.endsWith('.ts') && n !== 'palette-ucp.ts')
      .flatMap((n) => hexesIn(readFileSync(join(dir, n), 'utf-8')).map((h) => `${n}:${h}`))
    expect(others, others.join(', ')).toEqual([])
  })
})
