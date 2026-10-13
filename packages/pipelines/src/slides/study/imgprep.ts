/** Image file contract from 3.zip imagedata.py. The motor never downloads. */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { imageSizeFromBytes } from '@genoffice/pptx-render'

export const MIN_BYTES = 20_000
export const MAX_BYTES = 4_000_000
export const MIN_PX = 300
export const IMG_EXT = ['.jpg', '.jpeg', '.png'] as const
export const CAPTION_MIN = 15
export const CREDIT_MAX = 130
export const HARD_CAP = 10

export type InspectStatus = 'PASS' | 'FAIL'

function extOf(path: string): string {
  const i = path.lastIndexOf('.')
  return i < 0 ? '' : path.slice(i).toLowerCase()
}

export function inspectFile(path: string): [InspectStatus, string] {
  if (!existsSync(path)) return ['FAIL', `${path}: arquivo nao encontrado`]
  const size = statSync(path).size
  if (!(IMG_EXT as readonly string[]).includes(extOf(path))) {
    return ['FAIL', `${path}: extensao nao suportada (use jpg/jpeg/png)`]
  }
  if (size < MIN_BYTES) {
    return ['FAIL', `${path}: ${size} B abaixo do minimo ${MIN_BYTES / 1000} KB`]
  }
  if (size > MAX_BYTES) {
    return ['FAIL', `${path}: ${size} B acima do maximo ${MAX_BYTES / 1_000_000} MB`]
  }
  const dim = imageSizeFromBytes(readFileSync(path))
  if (!dim) return ['FAIL', `${path}: ilegivel (PNG IHDR / JPEG SOF)`]
  if (Math.min(dim.w, dim.h) < MIN_PX) {
    return ['FAIL', `${path}: ${dim.w}x${dim.h} px, lado menor < ${MIN_PX} px`]
  }
  return ['PASS', `${path}: ${dim.w}x${dim.h} px · ${Math.floor(size / 1024)} KB`]
}

export interface ImgprepFile {
  name: string
  status: InspectStatus
  message: string
}

export interface ImgprepResult {
  target: string
  ok: boolean
  missingDir: boolean
  failures: number
  files: ImgprepFile[]
  contract: string
}

export function prepareImages(target: string): ImgprepResult {
  const contract =
    `jpg/jpeg/png · ${MIN_BYTES / 1000} KB-${MAX_BYTES / 1_000_000} MB` +
    ` · lado menor >= ${MIN_PX} px · pie analitico >= ${CAPTION_MIN} car.` +
    ` · credito <= ${CREDIT_MAX} car.`
  if (!existsSync(target) || !statSync(target).isDirectory()) {
    return { target, ok: true, missingDir: true, failures: 0, files: [], contract }
  }
  const names = readdirSync(target)
    .filter((n) => (IMG_EXT as readonly string[]).includes(extOf(n)))
    .sort()
  const files = names.map((name) => {
    const [status, message] = inspectFile(join(target, name))
    return { name, status, message }
  })
  const failures = files.filter((f) => f.status === 'FAIL').length
  return { target, ok: failures === 0, missingDir: false, failures, files, contract }
}
