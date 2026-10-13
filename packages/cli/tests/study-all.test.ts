import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

const TITLE_MANIFEST = {
  course: { course: 'Fisiopatologia', institution: 'UCP' },
  config: { lang: 'pt-BR' },
  slides: [
    {
      module: 'title',
      title: 'Fisiopatologia da inflamação aguda',
      subtitle: 'Do estímulo lesivo à resolução',
      course: 'Fisiopatologia',
      institution: 'UCP',
    },
  ],
}

function writeManifest(dir: string, body: unknown = TITLE_MANIFEST): string {
  const path = join(dir, 'manifest.json')
  writeFileSync(path, JSON.stringify(body))
  return path
}

describe('genoffice study all', () => {
  it('writes a pptx with the compiled title copy', async () => {
    const dir = tempDir()
    const out = join(dir, 'aula.pptx')
    const r = await run(['study', 'all', writeManifest(dir), '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.status).toBe('ok')
    expect(j.command).toBe('study')
    expect(j.detail.slides).toBe(1)
    expect(j.detail.contrast).toEqual([])
    expect(j.detail.visual).toEqual([])
    expect(j.output_path).toBe(out)
    const zip = await JSZip.loadAsync(readFileSync(out))
    const xml = await zip.file('ppt/slides/slide1.xml')!.async('string')
    expect(xml).toContain('Fisiopatologia da inflamação aguda')
  })

  it('refuses to write when lint fails', async () => {
    const dir = tempDir()
    const out = join(dir, 'aula.pptx')
    const path = writeManifest(dir, {
      ...TITLE_MANIFEST,
      slides: [
        {
          module: 'definition',
          title: 'X',
          main_statement: 'É importante destacar que a inflamação é vascular.',
          key_points: [
            { title: 'A', desc: 'um ponto' },
            { title: 'B', desc: 'outro ponto' },
          ],
        },
      ],
    })
    const r = await run(['study', 'all', path, '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(1)
    expect(JSON.stringify(r.json().detail.errors)).toContain('STYLE_CRUTCH')
    expect(() => readFileSync(out)).toThrow()
  })
})
