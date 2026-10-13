/** Source ingest: numbered headings vs body. Convenience, not a contract. */

const NUMBERED_HEADING = /^\d{1,2}(\.\d{1,3})*[.)]?\s+\S/
const COUNT = /^\d{1,2}\.\d{3}\s/
const MARKDOWN_HEADING = /^#{1,6}\s+\S/

export function isHeading(line: string): boolean {
  if (line.length > 80 || line.endsWith('.')) return false
  if (COUNT.test(line)) return false
  if (MARKDOWN_HEADING.test(line)) return true
  return NUMBERED_HEADING.test(line)
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
    if (MARKDOWN_HEADING.test(line)) {
      const clean = line.replace(/^#{1,6}\s+/, '').replace(/[:.]\s*$/, '').trim()
      if (clean) lines.push(`\n## ${clean}`)
    } else if (isHeading(line)) {
      const clean = line.replace(/[:.]\s*$/, '').trim()
      lines.push(`\n## ${clean}`)
    } else {
      lines.push(`- ${line}`)
      blocks += 1
    }
  }
  return { markdown: `${lines.join('\n')}\n`, blocks }
}
