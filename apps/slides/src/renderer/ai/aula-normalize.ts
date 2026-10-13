/**
 * Lossless structural key mapping for StudyDeck manifests.
 *
 * Per SKILL.md §8 ("O que o motor nunca faz"):
 * - NEVER truncates text (no substring clipping).
 * - NEVER invents placeholder content or fake rows.
 * - NEVER rewrites domain prose with regexes.
 *
 * Only unwraps outer `[manifest]` arrays and maps unambiguous structural key aliases
 * (e.g. `events` -> `milestones`) if an LLM used an alias key name.
 * Any length or Layer B prose violation is surfaced by `lintDeck` and rewritten
 * properly by the LLM repair pass.
 */

type Rec = Record<string, unknown>

function isRec(v: unknown): v is Rec {
  return Boolean(v && typeof v === 'object' && !Array.isArray(v))
}

function mapSlideAliasesLossless(raw: Rec): Rec {
  const mod = String(raw.module ?? '')
  const d: Rec = { ...raw }

  if (mod === 'definition') {
    if (!d.title && typeof d.term === 'string') {
      d.title = d.term
      delete d.term
    }
    if (!d.main_statement && typeof d.definition === 'string') {
      d.main_statement = d.definition
      delete d.definition
    }
    if (!d.elaboration && typeof d.critical_distinction === 'string') {
      d.elaboration = d.critical_distinction
      delete d.critical_distinction
    }
  } else if (mod === 'timeline') {
    if (!Array.isArray(d.milestones) && Array.isArray(d.events)) {
      d.milestones = d.events.map((ev) => {
        if (!isRec(ev)) return ev
        return {
          label: ev.label ?? ev.phase ?? '',
          title: ev.title ?? ev.name ?? '',
          desc: ev.desc ?? ev.description ?? '',
        }
      })
      delete d.events
    }
  } else if (mod === 'pyramid') {
    if (Array.isArray(d.levels)) {
      d.levels = d.levels.map((lv) => {
        if (!isRec(lv)) return lv
        return {
          ...lv,
          title: lv.title ?? lv.name ?? '',
          desc: lv.desc ?? lv.description ?? '',
        }
      })
    }
  } else if (mod === 'algorithm') {
    if (Array.isArray(d.steps)) {
      d.steps = d.steps.map((st) => {
        if (!isRec(st)) return st
        return {
          ...st,
          title: st.title ?? st.name ?? '',
          desc: st.desc ?? st.action ?? st.description ?? '',
        }
      })
    }
  } else if (mod === 'side_by_side') {
    if (!d.left_card && (d.left_title || Array.isArray(d.left_points))) {
      d.left_card = {
        title: d.left_title ?? '',
        points: Array.isArray(d.left_points) ? d.left_points : [],
      }
      delete d.left_title
      delete d.left_points
    }
    if (!d.right_card && (d.right_title || Array.isArray(d.right_points))) {
      d.right_card = {
        title: d.right_title ?? '',
        points: Array.isArray(d.right_points) ? d.right_points : [],
      }
      delete d.right_title
      delete d.right_points
    }
  } else if (mod === 'socratic_question') {
    if (!Array.isArray(d.scaffold) && Array.isArray(d.steps)) {
      d.scaffold = d.steps
      delete d.steps
    }
    if (!d.context && typeof d.answer === 'string') {
      d.context = d.answer
      delete d.answer
    }
  } else if (mod === 'stat_card') {
    if (!d.stat_num && typeof d.stat === 'string') {
      d.stat_num = d.stat
      delete d.stat
    }
    if (!d.stat_title && typeof d.label === 'string') {
      d.stat_title = d.label
      delete d.label
    }
  } else if (mod === 'checklist') {
    if (Array.isArray(d.items)) {
      d.items = d.items.map((it) => {
        if (!isRec(it)) return it
        return {
          ...it,
          label: it.label ?? it.name ?? it.title ?? '',
          desc: it.desc ?? it.action ?? it.description ?? '',
        }
      })
    }
  }

  return d
}

export function normalizeManifestJson(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return raw
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return raw
  }

  if (Array.isArray(parsed) && parsed.length === 1 && isRec(parsed[0])) {
    parsed = parsed[0]
  }

  if (!isRec(parsed) || !Array.isArray(parsed.slides)) return raw

  const normalized: Rec = {
    ...parsed,
    slides: parsed.slides.map((s) => (isRec(s) ? mapSlideAliasesLossless(s) : s)),
  }

  return JSON.stringify(normalized, null, 2)
}
