import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { run, tempDir, writeMinimalPdf } from './helpers'

describe('genoffice study ingest pdf (3.zip ingest pdf|txt|md)', () => {
  it('writes outline.md from a PDF text layer', async () => {
    const dir = tempDir()
    const src = writeMinimalPdf(join(dir, 'fonte.pdf'), [
      '1. Inflamacao aguda',
      'Resposta vascular do tecido vivo.',
    ])
    const out = join(dir, 'work')
    const r = await run(['study', 'ingest', src, '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.detail.blocks).toBe(1)
    const md = readFileSync(join(out, 'outline.md'), 'utf-8')
    expect(md).toContain('## 1. Inflamacao aguda')
    expect(md).toContain('- Resposta vascular do tecido vivo.')
  })
})
