import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

describe('genoffice study contrast (3.zip studydeck contrast)', () => {
  it('prints the UCP fixture matrix as PASS', async () => {
    const r = await run(['study', 'contrast', '--json'])
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.status).toBe('ok')
    expect(j.detail.mode).toBe('fixture')
    expect(j.detail.theme).toBe('ucp')
    expect(j.detail.contrast).toBe(0)
    expect(j.detail.slides).toBe(35)
    expect(j.summary).toMatch(/PASS/)
  })

  it('scans a manifest and reports 0 violations', async () => {
    const dir = tempDir()
    const path = join(dir, 'm.json')
    writeFileSync(
      path,
      JSON.stringify({
        course: { course: 'Fisiopatologia' },
        config: { lang: 'pt-BR' },
        slides: [{ module: 'title', title: 'Inflamação aguda', course: 'Fisiopatologia' }],
      }),
    )
    const r = await run(['study', 'contrast', path, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.detail.mode).toBe('manifest')
    expect(j.detail.slides).toBe(1)
    expect(j.detail.contrast).toBe(0)
    expect(j.summary).toMatch(/PASS/)
  })
})
