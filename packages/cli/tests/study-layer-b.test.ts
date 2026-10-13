import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

describe('genoffice study lint --json layerB', () => {
  it('exposes Layer B rows on a crutch failure', async () => {
    const dir = tempDir()
    const path = join(dir, 'm.json')
    writeFileSync(
      path,
      JSON.stringify({
        course: { course: 'Fisiopatologia' },
        config: { lang: 'pt-BR' },
        slides: [
          {
            module: 'definition',
            title: 'X',
            main_statement: 'É importante destacar que a inflamação é vascular.',
            key_points: [
              { title: 'A', desc: 'um ponto' },
              { title: 'B', desc: 'outro ponto' },
            ],
          },
        ],
      }),
    )
    const r = await run(['study', 'lint', path, '--json'], { cwd: dir })
    expect(r.code).toBe(1)
    const j = r.json()
    expect(j.detail.layerB.some((row: { code: string }) => row.code === 'STYLE_CRUTCH')).toBe(true)
  })
})
