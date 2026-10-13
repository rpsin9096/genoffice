/** Lint lines → rows the Aula panel can render. Layer B stays visible, not a log dump. */

export type LayerBKind = 'style' | 'fit' | 'i18n' | 'contract' | 'other'

export interface LayerBRow {
  loc: string
  kind: LayerBKind
  code: string
  message: string
}

function locOf(line: string): string {
  const i = line.indexOf(':')
  return i > 0 ? line.slice(0, i) : line
}

export function layerBVisible(errors: readonly string[]): LayerBRow[] {
  return errors.map((message) => {
    const style = /^(.*?): estilo \[([A-Z_]+)\]/.exec(message)
    if (style) {
      return { loc: style[1]!, kind: 'style', code: style[2]!, message }
    }
    if (message.includes('transbordo')) {
      return { loc: locOf(message), kind: 'fit', code: 'FIT', message }
    }
    if (/\bdrift\b/.test(message)) {
      return { loc: locOf(message), kind: 'i18n', code: 'DRIFT', message }
    }
    if (/^slide \d+/.test(message)) {
      return { loc: locOf(message), kind: 'contract', code: 'CONTRACT', message }
    }
    return { loc: locOf(message), kind: 'other', code: 'OTHER', message }
  })
}
