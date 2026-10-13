import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { inspectFile, prepareImages } from '../src/slides/study/imgprep'

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

function dir(): string {
  const d = join(tmpdir(), `imgprep-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  mkdirSync(d)
  return d
}

describe('study imgprep (3.zip imagedata)', () => {
  it('INFO when the folder does not exist yet', () => {
    const r = prepareImages(join(tmpdir(), 'no-such-imgprep-folder'))
    expect(r.ok).toBe(true)
    expect(r.missingDir).toBe(true)
    expect(r.failures).toBe(0)
  })

  it('INFO when the folder has no jpg/png', () => {
    const r = prepareImages(dir())
    expect(r.ok).toBe(true)
    expect(r.files).toEqual([])
    expect(r.missingDir).toBe(false)
  })

  it('fails a file below 20 KB', () => {
    const path = join(dir(), 'tiny.png')
    writeFileSync(path, png(8, 8))
    const [status, msg] = inspectFile(path)
    expect(status).toBe('FAIL')
    expect(msg).toMatch(/abaixo do minimo 20 KB/)
  })

  it('fails a file whose shorter side is under 300 px', () => {
    const path = join(dir(), 'small.png')
    writeFileSync(path, png(80, 80, 25_000))
    const [status, msg] = inspectFile(path)
    expect(status).toBe('FAIL')
    expect(msg).toMatch(/lado menor < 300 px/)
  })

  it('passes a 300 px png at or above 20 KB', () => {
    const path = join(dir(), 'ok.png')
    writeFileSync(path, png(300, 320, 25_000))
    const [status, msg] = inspectFile(path)
    expect(status).toBe('PASS')
    expect(msg).toMatch(/300x320/)
  })

  it('rejects an unsupported extension', () => {
    const path = join(dir(), 'x.gif')
    writeFileSync(path, png(300, 300, 25_000))
    const [status, msg] = inspectFile(path)
    expect(status).toBe('FAIL')
    expect(msg).toMatch(/extensao nao suportada/)
  })
})
