import type { StudyPageSpec } from '@genoffice/pipelines/slides'
import type { RenderSlide } from '@genoffice/pptx-render'

export interface AulaLandApi {
  localGeneratePage: (op: {
    specJson: string
  }) => Promise<{ ok: boolean; marker?: string; error?: string }>
  landGeneratedPages: (
    pageMarkers: string[],
    fitWidthPx: number,
    mode?: 'replace' | 'append' | 'replace_at' | 'insert_at',
  ) => Promise<{ slides?: RenderSlide[]; error?: string } | { error: string }>
}

export type AulaLandResult =
  | { ok: true; slides: RenderSlide[] }
  | { ok: false; error: string }

/** Page-specs from aulaBuild → one-slide pptx markers → replace the open deck. */
export async function landAulaPages(
  pages: readonly StudyPageSpec[],
  api: AulaLandApi,
  fitWidthPx: number,
): Promise<AulaLandResult> {
  if (!pages.length) return { ok: false, error: 'nenhuma pagina para pousar' }
  const markers: string[] = []
  for (const [i, page] of pages.entries()) {
    const gen = await api.localGeneratePage({ specJson: JSON.stringify(page) })
    if (!gen.ok || !gen.marker) {
      return { ok: false, error: gen.error ?? `pagina ${i + 1} falhou` }
    }
    markers.push(gen.marker)
  }
  const landed = await api.landGeneratedPages(markers, fitWidthPx, 'replace')
  if ('slides' in landed && landed.slides) return { ok: true, slides: landed.slides }
  const err = 'error' in landed ? landed.error : undefined
  return { ok: false, error: err ?? 'land failed' }
}
