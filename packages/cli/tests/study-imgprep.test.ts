import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { run, tempDir } from './helpers'

function crc32(buf: Buffer): number {
  let c = ~0 >>> 0
  for (const b of buf) {
    c ^= b
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const t = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  return Buffer.concat([len, t, data, crc])
}

function png(w: number, h: number, pad = 0): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const rows: Buffer[] = []
  for (let y = 0; y < h; y += 1) rows.push(Buffer.alloc(1 + w * 3))
  const body = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return pad > body.length ? Buffer.concat([body, Buffer.alloc(pad - body.length)]) : body
}

describe('genoffice study imgprep (3.zip imgprep)', () => {
  it('INFO when work/imgs does not exist', async () => {
    const dir = tempDir()
    const r = await run(['study', 'imgprep', '--json'], { cwd: dir })
    expect(r.code).toBe(0)
    const j = r.json()
    expect(j.detail.missingDir).toBe(true)
    expect(j.summary).toMatch(/INFO/)
  })

  it('FAIL when a local png is below 20 KB', async () => {
    const dir = tempDir()
    const imgs = join(dir, 'imgs')
    mkdirSync(imgs)
    writeFileSync(join(imgs, 'tiny.png'), png(8, 8))
    const r = await run(['study', 'imgprep', imgs, '--json'], { cwd: dir })
    expect(r.code).toBe(1)
    expect(r.json().detail.failures).toBeGreaterThan(0)
  })
})
