/**
 * Layer B prose guard, ported from study-deck 3.zip style.py.
 * Domain terms (Layer A) are untouched; connective language is blocked.
 */

export type StyleLang = 'pt-BR' | 'es-ES' | 'en-US'

export interface StyleHit {
  term: string
  code: string
  hint: string
}

interface Family {
  hint: string
  terms?: readonly string[]
  patterns?: readonly string[]
}

const FAMILIES: Record<StyleLang, Record<string, Family>> = {
  'pt-BR': {
    STYLE_CRUTCH: {
      hint: 'cut the crutch; start with the fact',
      terms: [
        'vale destacar que',
        'cabe ressaltar que',
        'cabe destacar que',
        'e imperioso notar',
        'como e sabido',
        'em suma',
        'diante do exposto',
        'e importante lembrar',
        'e importante destacar',
        'neste cenario',
        'sob essa otica',
        'podemos dizer que',
        'convem notar que',
      ],
    },
    STYLE_METAPHOR: {
      hint: 'banned metaphor; use the operational verb',
      terms: [
        'arsenal',
        'trincheira',
        'blindar',
        'detonar',
        'devastar',
        'vertiginoso',
        'colossal',
        'revolucionario',
        'dramatico',
        'dramaticamente',
        'desatar',
        'deflagrar',
        'orquestrar',
        'harmonizar',
        'trampolim',
        'armas terapeuticas',
        'arma terapeutica',
        'ferramenta terapeutica',
      ],
    },
    STYLE_VAGUE: {
      hint: 'quantify; reproduce the number from the source',
      terms: [
        'diversos',
        'diversas',
        'inumeros',
        'inumeras',
        'entre outros',
        'relativamente',
        'comumente',
        'em geral',
        'varios',
        'varias',
        'etc',
      ],
    },
    STYLE_TAIL: {
      hint: 'loose participle: the derived fact earns its own field',
      patterns: [
        ',\\s*gerando\\b',
        ',\\s*cursando com\\b',
        ',\\s*trazendo\\b',
        ',\\s*resultando em\\b',
        ',\\s*levando a\\b',
        ',\\s*provocando\\b',
        ',\\s*causando\\b',
      ],
    },
  },
  'es-ES': {
    STYLE_CRUTCH: {
      hint: 'cut the crutch; start with the fact',
      terms: [
        'cabe resaltar que',
        'cabe destacar que',
        'vale la pena destacar',
        'vale la pena senalar',
        'es imperioso notar',
        'como es sabido',
        'en resumen',
        'en sintesis',
        'frente a lo expuesto',
        'es importante recordar',
        'es importante destacar',
        'en este escenario',
        'podemos decir que',
        'conviene notar que',
      ],
    },
    STYLE_METAPHOR: {
      hint: 'banned metaphor; use the operational verb',
      terms: [
        'arsenal',
        'trinchera',
        'blindar',
        'detonar',
        'devastar',
        'vertiginoso',
        'colosal',
        'revolucionario',
        'dramatico',
        'dramaticamente',
        'desatar',
        'deflagrar',
        'orquestar',
        'armonizar',
        'trampolin',
        'armas terapeuticas',
        'arma terapeutica',
        'herramienta terapeutica',
      ],
    },
    STYLE_VAGUE: {
      hint: 'quantify; reproduce the number from the source',
      terms: [
        'diversos',
        'diversas',
        'innumerables',
        'entre otros',
        'relativamente',
        'comunmente',
        'en general',
        'varios',
        'varias',
        'etc',
      ],
    },
    STYLE_TAIL: {
      hint: 'loose participle: the derived fact earns its own field',
      patterns: [
        ',\\s*generando\\b',
        ',\\s*cursando con\\b',
        ',\\s*trayendo\\b',
        ',\\s*dando lugar a\\b',
        ',\\s*provocando\\b',
        ',\\s*causando\\b',
      ],
    },
  },
  'en-US': {
    STYLE_CRUTCH: {
      hint: 'cut the crutch; start with the fact',
      terms: [
        'it is worth noting',
        'it is important to note',
        'it is important to remember',
        'as is well known',
        'needless to say',
        'in summary',
        'in this scenario',
        'we can say that',
        'it should be noted',
      ],
    },
    STYLE_METAPHOR: {
      hint: 'banned metaphor; use the operational verb',
      terms: [
        'arsenal',
        'battleground',
        'battlefield',
        'shield',
        'detonate',
        'devastate',
        'dizzying',
        'colossal',
        'revolutionary',
        'dramatic',
        'dramatically',
        'unleash',
        'orchestrate',
        'harmonize',
        'springboard',
        'therapeutic weapons',
        'therapeutic tool',
      ],
    },
    STYLE_VAGUE: {
      hint: 'quantify; reproduce the number from the source',
      terms: [
        'several',
        'numerous',
        'various',
        'among others',
        'relatively',
        'commonly',
        'in general',
        'etc',
      ],
    },
    STYLE_TAIL: {
      hint: 'loose participle: the derived fact earns its own field',
      patterns: [
        ',\\s*generating\\b',
        ',\\s*causing\\b',
        ',\\s*bringing\\b',
        ',\\s*leading to\\b',
        ',\\s*resulting in\\b',
      ],
    },
  },
}

const CONTEXTUAL: Record<StyleLang, Record<string, readonly string[]>> = {
  'pt-BR': {
    colapso: ['hemodinamico', 'cardiogenico', 'cardiocirculatorio', 'cardiovascular'],
    fulminante: ['hepatite', 'miocardite', 'edema', 'malaria'],
    catastrofico: ['antifosfolipide', 'antifosfolipidea'],
  },
  'es-ES': {
    colapso: ['hemodinamico', 'cardiogenico', 'cardiocirculatorio'],
    fulminante: ['hepatitis', 'miocarditis', 'edema', 'malaria'],
    catastrofico: ['antifosfolipido', 'antifosfolipidea'],
  },
  'en-US': {
    collapse: ['hemodynamic', 'cardiogenic', 'cardiovascular'],
    fulminant: ['hepatitis', 'myocarditis', 'edema', 'malaria'],
    catastrophic: ['antiphospholipid'],
  },
}

const SENTENCE = /[^.!?;]+/g
const SUFFIX = '(?:s|es|ed|ing)?'

function plain(text: string): string {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
}

function wordPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<!\\w)${escaped}${SUFFIX}(?!\\w)`)
}

export function styleHits(
  text: string,
  lang: StyleLang = 'pt-BR',
  allow: readonly string[] = [],
): StyleHit[] {
  if (!text || !text.trim()) return []
  const families = FAMILIES[lang] ?? FAMILIES['pt-BR']
  const contextual = CONTEXTUAL[lang] ?? CONTEXTUAL['pt-BR']
  const allowSet = new Set(allow.map(plain))
  const out: StyleHit[] = []
  const sentences = text.match(SENTENCE) ?? [text]
  for (const sentence of sentences) {
    const p = plain(sentence)
    for (const [code, spec] of Object.entries(families)) {
      for (const term of spec.terms ?? []) {
        if (allowSet.has(plain(term))) continue
        if (wordPattern(plain(term)).test(p)) out.push({ term, code, hint: spec.hint })
      }
      for (const pattern of spec.patterns ?? []) {
        if (new RegExp(pattern).test(p)) out.push({ term: pattern, code, hint: spec.hint })
      }
    }
    for (const [word, qualifiers] of Object.entries(contextual)) {
      if (wordPattern(word).test(p) && !allowSet.has(plain(word))) {
        if (!qualifiers.some((q) => p.includes(plain(q)))) {
          out.push({
            term: word,
            code: 'STYLE_LITERAL',
            hint: 'figurative clinical term; only the qualified literal sense passes',
          })
        }
      }
    }
  }
  return out
}
