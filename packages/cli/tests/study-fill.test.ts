import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

describe('genoffice study fill', () => {
  it('prints a BYOK brief from outline.md', async () => {
    const dir = tempDir()
    const src = join(dir, 'outline.md')
    writeFileSync(src, '# OUTLINE — fonte.md\n\n## 1. Inflamação aguda\n- Resposta vascular.\n')
    const r = await run(['study', 'fill', src, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.detail.brief).toContain('Inflamação aguda')
    expect(String(j.detail.brief).toLowerCase()).toMatch(/n[aã]o coloca x/)
  })
})
