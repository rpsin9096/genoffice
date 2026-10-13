import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
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

describe('genoffice study', () => {
  it('lints a clean study manifest', async () => {
    const dir = tempDir()
    const r = await run(['study', 'lint', writeManifest(dir), '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.status).toBe('ok')
    expect(j.command).toBe('study')
    expect(j.summary).toMatch(/PASS/)
    expect(j.detail.slides).toBe(1)
    expect(j.detail.errors).toEqual([])
  })

  it('fails lint on Layer B crutch', async () => {
    const dir = tempDir()
    const path = writeManifest(dir, {
      ...TITLE_MANIFEST,
      slides: [
        {
          module: 'definition',
          title: 'X',
          main_statement: 'É importante destacar que a inflamação é vascular.',
        },
      ],
    })
    const r = await run(['study', 'lint', path, '--json'], { cwd: dir })
    expect(r.code).toBe(1)
    const j = r.json()
    expect(j.status).toBe('error')
    expect(JSON.stringify(j.detail.errors)).toContain('STYLE_CRUTCH')
  })

  it('compiles page specs into --out as 01.json', async () => {
    const dir = tempDir()
    const out = join(dir, 'pages')
    mkdirSync(out)
    const r = await run(['study', 'compile', writeManifest(dir), '--out', out, '--json'], {
      cwd: dir,
    })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.status).toBe('ok')
    expect(j.detail.files).toEqual(['01.json'])
    const page = JSON.parse(readFileSync(join(out, '01.json'), 'utf-8'))
    expect(page.layout).toBe('study_title')
    expect(page.module).toBe('title')
    expect(JSON.stringify(page)).toContain('Fisiopatologia da inflamação aguda')
    expect(page.elements.length).toBeGreaterThan(2)
  })

  it('refuses compile when lint fails', async () => {
    const dir = tempDir()
    const out = join(dir, 'pages')
    mkdirSync(out)
    const path = writeManifest(dir, {
      ...TITLE_MANIFEST,
      slides: [
        {
          module: 'definition',
          title: 'X',
          main_statement: 'É importante destacar que a inflamação é vascular.',
        },
      ],
    })
    const r = await run(['study', 'compile', path, '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(1)
    const j = r.json()
    expect(j.status).toBe('error')
    expect(JSON.stringify(j.detail.errors)).toContain('STYLE_CRUTCH')
  })
})
