/** Fase 3 session: material → curve → Layer B. Build only if lint is clean. */
import { compileDeck, type StudyPageSpec } from './compile'
import { deckContrastFailures } from './contrast'
import { ingestOutline } from './ingest'
import { layerBVisible, type LayerBRow } from './layer-b'
import { lintDeck } from './lint'
import { parseStudyManifest } from './manifest'
import { marketingHits, parseStudyCurve, type StudyCurve } from './curve'
import { fillPoison } from './fill-poison'
import { deckVisualFailures } from './visual'

export interface AulaSessionInput {
  sourceText?: string
  sourceLabel?: string
  manifestJson?: string
}

export interface AulaSession {
  sourceLabel: string
  outline: string
  curve: StudyCurve
  layerB: LayerBRow[]
  canBuild: boolean
}

export function aulaSession(input: AulaSessionInput = {}): AulaSession {
  const sourceLabel = input.sourceLabel?.trim() || 'fonte'
  let outline = ''
  let curve = parseStudyCurve('')
  const source = input.sourceText ?? ''
  if (source.trim()) {
    const ingested = ingestOutline(source, sourceLabel)
    outline = ingested.markdown
    curve = parseStudyCurve(outline)
  }

  const layerB: LayerBRow[] = []
  const raw = input.manifestJson?.trim() ?? ''
  if (raw) {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      layerB.push({ loc: 'manifest', kind: 'other', code: 'JSON', message: 'manifest JSON invalido' })
      return { sourceLabel, outline, curve, layerB, canBuild: false }
    }
    const hits = marketingHits(parsed)
    if (hits.length) {
      for (const h of hits) {
        layerB.push({ loc: 'outline', kind: 'other', code: 'MARKETING', message: h })
      }
      return { sourceLabel, outline, curve, layerB, canBuild: false }
    }
    const poison = fillPoison(parsed)
    if (poison.length) {
      for (const p of poison) {
        layerB.push({ loc: p, kind: 'other', code: 'FILL_POISON', message: `${p}: o LLM nao coloca x/y/tier` })
      }
      return { sourceLabel, outline, curve, layerB, canBuild: false }
    }
    const manifest = parseStudyManifest(raw)
    if (!manifest.ok) {
      layerB.push({ loc: 'manifest', kind: 'other', code: 'JSON', message: manifest.error })
      return { sourceLabel, outline, curve, layerB, canBuild: false }
    }
    const errors = lintDeck(manifest.manifest.slides, manifest.manifest.config?.lang ?? 'pt-BR')
    layerB.push(...layerBVisible(errors))
  }

  return { sourceLabel, outline, curve, layerB, canBuild: layerB.length === 0 && Boolean(raw) }
}

export type AulaBuildResult =
  | { ok: true; pages: StudyPageSpec[]; session: AulaSession }
  | { ok: false; pages: []; session: AulaSession }

export function aulaBuild(input: AulaSessionInput = {}): AulaBuildResult {
  const session = aulaSession(input)
  if (!session.canBuild) return { ok: false, pages: [], session }
  const raw = input.manifestJson!.trim()
  const parsed = parseStudyManifest(raw)
  if (!parsed.ok) {
    return {
      ok: false,
      pages: [],
      session: {
        ...session,
        canBuild: false,
        layerB: [
          ...session.layerB,
          { loc: 'manifest', kind: 'other', code: 'JSON', message: parsed.error },
        ],
      },
    }
  }
  const compiled = compileDeck(parsed.manifest)
  const contrast = deckContrastFailures(compiled)
  const visual = deckVisualFailures(compiled)
  if (contrast.length || visual.length) {
    const extra: LayerBRow[] = [
      ...contrast.map((c) => ({
        loc: `slide ${c.slide} [${c.module}]`,
        kind: 'other' as const,
        code: 'CONTRAST',
        message: `${c.fg}/${c.bg}`,
      })),
      ...visual.map((v) => ({
        loc: `slide ${v.slide} [${v.module}]`,
        kind: 'other' as const,
        code: 'VISUAL',
        message: v.code,
      })),
    ]
    return {
      ok: false,
      pages: [],
      session: { ...session, canBuild: false, layerB: [...session.layerB, ...extra] },
    }
  }
  return { ok: true, pages: compiled.map((r) => r.page), session }
}
