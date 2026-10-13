import { describe, expect, it } from 'vitest'
import { run } from './helpers'

describe('genoffice study schema tokens (3.zip schema tokens)', () => {
  it('prints the UCP WCAG text tokens', async () => {
    const r = await run(['study', 'schema', 'tokens', '--json'])
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.status).toBe('ok')
    expect(j.summary).toMatch(/tokens WCAG/i)
    expect(j.detail.theme).toBe('ucp')
    expect(j.detail.tokens.ucp.on_primary).toMatch(/^[0-9A-Fa-f]{6}$/)
    expect(j.detail.tokens.ucp.on_accent).toMatch(/^[0-9A-Fa-f]{6}$/)
    expect(j.detail.tokens.ucp.ink_accent).toMatch(/^[0-9A-Fa-f]{6}$/)
    expect(j.detail.tokens.ucp.ink_success).toMatch(/^[0-9A-Fa-f]{6}$/)
    expect(j.detail.tokens.ucp.subtitle_on_primary).toMatch(/^[0-9A-Fa-f]{6}$/)
  })

  it('points the catalog at schema tokens', async () => {
    const r = await run(['study', 'schema', '--json'])
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.summary).toMatch(/schema tokens/)
  })
})
