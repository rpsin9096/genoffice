import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

describe('genoffice study ingest', () => {
  it('writes outline.md from numbered headings', async () => {
    const dir = tempDir()
    const src = join(dir, 'fonte.md')
    writeFileSync(src, '1. Inflamação aguda\nResposta vascular do tecido vivo.\n')
    const out = join(dir, 'work')
    const r = await run(['study', 'ingest', src, '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.detail.blocks).toBe(1)
    const md = readFileSync(join(out, 'outline.md'), 'utf-8')
    expect(md).toContain('## 1. Inflamação aguda')
    expect(md).toContain('- Resposta vascular do tecido vivo.')
  })
})
