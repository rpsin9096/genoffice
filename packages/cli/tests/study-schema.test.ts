import { describe, expect, it } from 'vitest'
import { run } from './helpers'

describe('genoffice study schema (3.zip studydeck schema)', () => {
  it('lists 35 modules with their when copy', async () => {
    const r = await run(['study', 'schema', '--json'])
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.status).toBe('ok')
    expect(j.command).toBe('study')
    expect(j.detail.modules).toHaveLength(35)
    const def = j.detail.modules.find((m: { module: string }) => m.module === 'definition')
    expect(def.when).toContain('tese central')
    const names = j.detail.modules.map((m: { module: string }) => m.module)
    expect(names).toContain('colloquy')
    expect(names).toContain('cycle_diagram')
  })

  it('prints QUANDO USAR, required fields and a JSON skeleton for one module', async () => {
    const r = await run(['study', 'schema', 'definition', '--json'])
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.summary).toContain('QUANDO USAR')
    expect(j.summary).toContain('tese central')
    expect(j.detail.module).toBe('definition')
    expect(j.detail.when).toContain('tese central')
    expect(j.detail.required).toContain('main_statement')
    expect(j.detail.skeleton.module).toBe('definition')
    expect(j.detail.skeleton.main_statement).toMatch(/<=\s*\d+\s*car\.>/)
    expect(j.detail.skeleton.key_points.length).toBe(2)
  })

  it('rejects an unknown module', async () => {
    const r = await run(['study', 'schema', 'cover_hero', '--json'])
    expect(r.code).toBe(1)
    const j = r.json()
    expect(j.status).toBe('error')
    expect(j.message.toLowerCase()).toMatch(/desconhecido|unknown/)
  })
})
