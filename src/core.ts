/**
 * Pure, dependency-free core for dsh-plugin-task-console (Task Live Console).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const timeline: any[] = []
  let errors = 0
  let tokens = 0
  for (const e of list) {
    if (!isRecord(e) || typeof e.type !== 'string') continue
    const t = e.type
    if (t.includes('error') || t.includes('fail')) errors++
    if (isRecord(e.data) && typeof e.data.tokens === 'number') tokens += e.data.tokens
    timeline.push({
      type: t,
      flag: t.includes('tool') ? 'tool'
        : t.includes('request') || t.includes('model') ? 'model'
        : t.includes('error') || t.includes('fail') ? 'error' : 'info',
    })
  }
  const last = timeline.length ? timeline[timeline.length - 1] : null
  return {
    sampledEvents: list.length,
    steps: timeline.length,
    errors,
    tokens,
    lastEvent: last ? last.type : '(none)',
    tail: timeline.slice(-12),
    controls: ['pause', 'inject', 'retry-current', 'terminate'],
  }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[task-console] ' + a.steps + ' step(s) · ' + a.errors + ' error(s)' +
    (a.tokens ? ' · ~' + a.tokens + ' tokens' : '') + ' · last=' + redact(a.lastEvent)
  if (a.tail.length === 0) return head + '\n  no live events observed yet'
  const lines = a.tail.map((s, i) => '  [' + s.flag.toUpperCase() + '] ' + redact(s.type))
  return [head, ...lines].join('\n') + '\nControls: ' + a.controls.join(', ')
}
