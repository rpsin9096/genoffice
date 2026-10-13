/** Image source schemes from study-deck 3.zip images.classify. The motor never downloads. */

export type ImageScheme =
  'web' | 'insecure-web' | 'ai' | 'placeholder' | 'local' | 'empty' | 'unsupported'

const LOCAL_EXT = ['.jpg', '.jpeg', '.png'] as const

export function classify(source: unknown): { scheme: ImageScheme; value: string } {
  const s = String(source ?? '').trim()
  if (!s) return { scheme: 'empty', value: s }
  const low = s.toLowerCase()
  if (low.startsWith('https://')) return { scheme: 'web', value: s }
  if (low.startsWith('http://')) return { scheme: 'insecure-web', value: s }
  if (low.startsWith('ai:')) return { scheme: 'ai', value: s.slice(3).trim() }
  if (low.startsWith('placeholder:')) {
    return { scheme: 'placeholder', value: s.slice('placeholder:'.length).trim() }
  }
  if (low.includes('://')) return { scheme: 'unsupported', value: s }
  if (LOCAL_EXT.some((ext) => low.endsWith(ext))) return { scheme: 'local', value: s }
  return { scheme: 'unsupported', value: s }
}

export function panelLabel(scheme: ImageScheme, value: string): string {
  if (scheme === 'web') return `FUENTE WEB · ${value}`
  if (scheme === 'ai') return `FIGURA AI · ${value}`
  if (scheme === 'placeholder') return `MARCADOR · ${value}`
  return value
}
