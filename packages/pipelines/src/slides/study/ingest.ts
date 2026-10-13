/** Source ingest: numbered headings vs body. Convenience, not a contract. */

const HEADING = /^\d{1,2}(\.\d{1,3})*[.)]?\s+\S/
const COUNT = /^\d{1,2}\.\d{3}\s/

export function isHeading(line: string): boolean {
  if (line.length > 80 || line.endsWith('.')) return false
  if (COUNT.test(line)) return false
  return HEADING.test(line)
}

export function ingestOutline(
  text: string,
  sourceLabel: string,
): { markdown: string; blocks: number } {
  const lines = [`# OUTLINE — ${sourceLabel}`, '']
  let blocks = 0
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (isHeading(line)) lines.push(`\n## ${line}`)
    else {
      lines.push(`- ${line}`)
      blocks += 1
    }
  }
  return { markdown: `${lines.join('\n')}\n`, blocks }
}
