import { describe, expect, it, vi } from 'vitest'
import { landAulaPages } from '../src/renderer/ai/aula-land'
import type { StudyPageSpec } from '@genoffice/pipelines/slides'

const PAGE = {
  background: '3854CC',
  title: 'Inflamação aguda',
  type: 'cover',
  layout: 'study_title',
  module: 'title',
  tier: 'STANDARD',
  elements: [],
} as StudyPageSpec

describe('landAulaPages (Fase 3: specs → canvas)', () => {
  it('generates each page locally and lands them as replace', async () => {
    const localGeneratePage = vi.fn(async ({ specJson }: { specJson: string }) => {
      const spec = JSON.parse(specJson) as { layout: string }
      return { ok: true as const, marker: `local:${spec.layout}` }
    })
    const landGeneratedPages = vi.fn(async (markers: string[], fit: number, mode?: string) => ({
      path: '',
      slides: [{ id: 's1' }],
      size: { cx: 1, cy: 1 },
      markers,
      fit,
      mode,
    }))
    const r = await landAulaPages([PAGE], { localGeneratePage, landGeneratedPages }, 1280)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(localGeneratePage).toHaveBeenCalledTimes(1)
    expect(landGeneratedPages).toHaveBeenCalledWith(['local:study_title'], 1280, 'replace')
    expect(r.slides).toHaveLength(1)
  })

  it('does not land when a page fails to generate', async () => {
    const landGeneratedPages = vi.fn()
    const r = await landAulaPages(
      [PAGE],
      {
        localGeneratePage: async () => ({ ok: false, error: 'bad spec' }),
        landGeneratedPages,
      },
      1280,
    )
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toMatch(/bad spec/)
    expect(landGeneratedPages).not.toHaveBeenCalled()
  })
})
