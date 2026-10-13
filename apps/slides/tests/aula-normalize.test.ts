import { describe, expect, it, vi } from 'vitest'
import { listStudyModules } from '@genoffice/pipelines/slides/study-aula'
import {
  buildStudySystemPrompt,
  extractCompletedSlidesFromPartialJson,
  generateStudyDeckParallel,
  type AulaAiBridge,
} from '../src/renderer/ai/aula-ai'
import { normalizeManifestJson } from '../src/renderer/ai/aula-normalize'

describe('aula-normalize (strictly lossless per SKILL.md §8)', () => {
  it('maps structural alias keys without truncating text or inventing items', () => {
    const longText = 'A'.repeat(300)
    const raw = JSON.stringify([
      {
        course: { course: 'Farmacologia' },
        config: { lang: 'pt-BR' },
        slides: [
          {
            module: 'timeline',
            title: 'Síntese de acetilcolina',
            events: [
              { phase: '1', title: 'Captação', description: longText },
            ],
          },
        ],
      },
    ])
    const normalized = JSON.parse(normalizeManifestJson(raw))
    expect(normalized.slides[0].milestones).toHaveLength(1)
    expect(normalized.slides[0].milestones[0].label).toBe('1')
    // Must NOT truncate the 300-char string
    expect(normalized.slides[0].milestones[0].desc).toBe(longText)
  })
})

describe('aula-ai (35 modules + progressive streaming + parallel batches)', () => {
  it('includes all 35 StudyDeck v3 modules and their skeletons in the system prompt', () => {
    const prompt = buildStudySystemPrompt()
    for (const { module } of listStudyModules()) {
      expect(prompt).toContain(`- ${module} (`)
    }
  })

  it('extracts completed slide objects progressively from an incomplete JSON stream', () => {
    const partialStream = `{"slides": [
      {"module": "title", "title": "Farmacologia", "subtitle": "Autonômica"},
      {"module": "definition", "title": "Sinapse", "main_statement": "Em andamento...`
    const slides = extractCompletedSlidesFromPartialJson(partialStream)
    expect(slides).toHaveLength(1)
    expect(slides[0]!.module).toBe('title')
  })

  it('generates batches in parallel and emits progressive canvas updates', async () => {
    const listeners = new Set<(c: any) => void>()
    const bridge: AulaAiBridge = {
      onAiStream: (fn) => {
        listeners.add(fn)
        return () => listeners.delete(fn)
      },
      aiStream: vi.fn(async (req) => {
        const isFirst = req.messages[0]!.text.includes('Bloco 1')
        const payload = isFirst
          ? JSON.stringify({
              slides: [
                {
                  module: 'title',
                  title: 'Farmacologia',
                  subtitle: 'Transmissão autonômica',
                  course: 'Farmacologia',
                  institution: 'UCP',
                },
              ],
            })
          : JSON.stringify({
              slides: [
                {
                  module: 'section_divider',
                  section_title: 'Dinâmica adrenérgica',
                  section_subtitle: 'Receptores alfa e beta em vasos e miocárdio.',
                },
              ],
            })
        for (const fn of listeners) {
          fn({ requestId: req.requestId, type: 'delta', text: payload })
          fn({ requestId: req.requestId, type: 'done' })
        }
      }),
    }

    const progressPages: number[] = []
    const finalJson = await generateStudyDeckParallel({
      bridge,
      sourceText: '## Colinérgica\nA\n## Adrenérgica\nB\n## AINEs\nC\n## Choque\nD',
      sections: [
        { heading: 'Colinérgica', blocks: ['A'] },
        { heading: 'Adrenérgica', blocks: ['B'] },
        { heading: 'AINEs', blocks: ['C'] },
        { heading: 'Choque', blocks: ['D'] },
      ],
      onProgress: (_json, pages) => {
        if (pages.length > 0) progressPages.push(pages.length)
      },
    })

    expect(progressPages.length).toBeGreaterThan(0)
    const parsed = JSON.parse(finalJson)
    expect(parsed.slides.length).toBe(2)
  })
})
