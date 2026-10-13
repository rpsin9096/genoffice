import { describe, expect, it } from 'vitest'
import {
  BODY_FLOOR_PT,
  CANVAS_H,
  CANVAS_W,
  COMPACT,
  CONTENT_BAND_H,
  CONTENT_BOTTOM,
  FOOTER_Y,
  SAFE_Y0,
  STANDARD,
  TYPE_FLOOR_PT,
  inToPx,
  tierFor,
  typePt,
} from '../src/slides/study/geometry'

/** Same fixture as study-deck 3.zip tests/test_density.py */
const DENSE = 'x'.repeat(190)
const SPARSE = ['Leituras iniciais', 'Estudo de caso', 'Revisao final']

describe('study geometry (3.zip parity)', () => {
  it('keeps the canonical 16:9 canvas and content band', () => {
    expect(CANVAS_W).toBeCloseTo(13.333, 3)
    expect(CANVAS_H).toBeCloseTo(7.5, 3)
    expect(CONTENT_BOTTOM).toBeCloseTo(6.6, 6)
    expect(CONTENT_BAND_H).toBeCloseTo(4.95, 6)
    expect(CONTENT_BOTTOM).toBeLessThanOrEqual(FOOTER_Y)
    expect(CONTENT_BAND_H).toBeCloseTo(CONTENT_BOTTOM - SAFE_Y0 - 0.1, 6)
  })

  it('converts inches on the 96-dpi canvas GenOffice uses', () => {
    expect(inToPx(CANVAS_W)).toBe(1280)
    expect(inToPx(CANVAS_H)).toBe(720)
  })

  it('keeps content that fits on STANDARD', () => {
    expect(tierFor(SPARSE, 5.88, 11.0, 4.95)).toBe(STANDARD)
  })

  it('falls back to COMPACT when the zone overflows', () => {
    expect(tierFor([DENSE, DENSE, DENSE], 3.0, 11.0, 4.95)).toBe(COMPACT)
  })

  it('never invents a third tier', () => {
    const absurd = Array.from({ length: 5 }, () => DENSE.repeat(6))
    expect(tierFor(absurd, 2.0, 11.0, 4.95)).toBe(COMPACT)
  })

  it('does not rescale STANDARD type', () => {
    expect(typePt(11.0, STANDARD)).toBeCloseTo(11.0, 6)
    expect(typePt(9.5, STANDARD, true)).toBeCloseTo(9.5, 6)
  })

  it('steps COMPACT type down once without breaking floors', () => {
    const stepped = typePt(12.0, COMPACT)
    expect(stepped).toBeLessThan(12.0)
    expect(stepped).toBeGreaterThanOrEqual(TYPE_FLOOR_PT)
    expect(typePt(9.2, COMPACT)).toBeGreaterThanOrEqual(TYPE_FLOOR_PT)
    expect(typePt(10.8, COMPACT, true)).toBeGreaterThanOrEqual(BODY_FLOOR_PT)
  })
})
