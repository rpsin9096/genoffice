import { describe, expect, it } from 'vitest'
import { run } from './helpers'

describe('genoffice study check (3.zip studydeck check)', () => {
  it('renders 35/35 fixture modules with contrast PASS', async () => {
    const r = await run(['study', 'check', '--json'])
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.status).toBe('ok')
    expect(j.detail.modules).toBe(35)
    expect(j.detail.ok).toBe(35)
    expect(j.detail.contrast).toBe(0)
    expect(j.summary).toMatch(/35\/35/)
    expect(j.summary).toMatch(/PASS/)
  })
})
