/** Keys the LLM must not write. ADR-S1: the motor places x. */
const POISON_KEYS = new Set(['x', 'y', 'w', 'h', 'tier'])

export function fillPoison(value: unknown, path = '$'): string[] {
  const hits: string[] = []
  walk(value, path, hits)
  return hits
}

function walk(value: unknown, path: string, hits: string[]): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${path}[${i}]`, hits))
    return
  }
  for (const [k, v] of Object.entries(value)) {
    if (POISON_KEYS.has(k)) hits.push(`${path}.${k}`)
    walk(v, `${path}.${k}`, hits)
  }
}
