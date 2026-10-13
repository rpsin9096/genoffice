import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

describe('genoffice study curve', () => {
  it('prints sections and when from outline.md', async () => {
    const dir = tempDir()
    const src = join(dir, 'outline.md')
    writeFileSync(src, '# OUTLINE — fonte.md\n\n## 1. Inflamação aguda\n- Resposta vascular.\n')
    const r = await run(['study', 'curve', src, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.detail.sections).toHaveLength(1)
    expect(j.detail.sections[0].heading).toContain('Inflamação aguda')
    expect(j.detail.when).toHaveLength(35)
  })

  it('refuses a marketing outline', async () => {
    const dir = tempDir()
    const src = join(dir, 'outline.json')
    writeFileSync(
      src,
      JSON.stringify({
        core_hook: 'hook',
        pages: [
          {
            title: 'Cover',
            type: 'cover',
            layout: 'cover_typography_hero',
            brief: 'marketing cover not a study module',
            image_queries: [],
          },
        ],
      }),
    )
    const r = await run(['study', 'curve', src, '--json'], { cwd: dir })
    expect(r.code).toBe(1)
    expect(JSON.stringify(r.json())).toMatch(/cover_typography_hero|marketing/)
  })
})
