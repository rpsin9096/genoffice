import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

describe('genoffice study new (3.zip studydeck new)', () => {
  it('writes a 4-slide JSON scaffold that lints', async () => {
    const dir = tempDir()
    const out = join(dir, 'manifest.json')
    const r = await run(['study', 'new', '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.detail.profile).toBe('short')
    expect(j.detail.slides).toBe(4)
    const body = JSON.parse(readFileSync(out, 'utf-8'))
    expect(body.config.lang).toBe('pt-BR')
    expect(body.config.profile).toBe('short')
    expect(body.slides.map((s: { module: string }) => s.module)).toEqual([
      'title',
      'section_divider',
      'definition',
      'checklist',
    ])
    const lint = await run(['study', 'lint', out, '--json'], { cwd: dir })
    expect(lint.code).toBe(0)
  })

  it('accepts the lecture guide', async () => {
    const dir = tempDir()
    const out = join(dir, 'aula.json')
    const r = await run(['study', 'new', 'lecture', '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    expect(r.json().detail.profile).toBe('lecture')
    expect(JSON.parse(readFileSync(out, 'utf-8')).config.profile).toBe('lecture')
  })

  it('does not overwrite an existing file', async () => {
    const dir = tempDir()
    const out = join(dir, 'manifest.json')
    writeFileSync(out, '{"keep":true}\n')
    const r = await run(['study', 'new', '--out', out, '--json'], { cwd: dir })
    expect(r.code).toBe(1)
    expect(readFileSync(out, 'utf-8')).toContain('"keep"')
  })

  it('rejects an unknown guide', async () => {
    const dir = tempDir()
    const r = await run(['study', 'new', 'webinar', '--out', join(dir, 'm.json'), '--json'], {
      cwd: dir,
    })
    expect(r.code).toBe(1)
    expect(r.json().message.toLowerCase()).toMatch(/guia/)
  })
})
