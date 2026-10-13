/** Motor labels from study-deck 3.zip i18n.py. Default UI language is pt-BR. */

export type StudyLang = 'pt-BR' | 'es-ES' | 'en-US'

const LABELS: Record<StudyLang, Record<string, string>> = {
  'pt-BR': {
    central: 'DECLARAÇÃO CENTRAL',
    chapter: 'CAPÍTULO',
    takeaway: 'CONCLUSÃO EDITORIAL:  ',
    source: 'Fonte / Crédito: {c}',
    join: '{f}  •  Crédito: {c}',
    vignette: 'VINHETA CLÍNICA',
    findings: 'ACHADOS CLÍNICOS & EXAMES',
    reasoning: 'RAZIOCÍNIO DIAGNÓSTICO',
    diagnosis: 'DIAGNÓSTICO DEFINITIVO',
    pearl: 'PÉROLA CLÍNICA',
    objectives: 'OBJETIVOS DE APRENDIZAGEM',
    glossary: 'GLOSSÁRIO',
    reading: 'LEITURA DOS DADOS',
    shared: 'COMUM',
    house: 'DEBATE',
    verdict: 'VEREDITO DO MODERADOR:',
    tutorial: 'PERGUNTA DE TUTORIA',
    viva: 'PROVA ORAL',
    model_answer: 'RESPOSTA MODELO',
    examiner: 'NOTA DO EXAMINADOR',
    clinical_use: 'USO CLÍNICO',
    origin: 'ORIGEM',
    modern_use: 'ACEPCIÓN ATUAL',
    limitation: 'LIMITAÇÃO',
    legacy: 'LEGADO',
    references: 'REFERÊNCIAS',
    tutor: 'TUTOR',
    student: 'ESTUDANTE',
    marginalia: 'MARGINALIA',
    remember: 'lembrar',
    understand: 'compreender',
    apply: 'aplicar',
    analyze: 'analisar',
    evaluate: 'avaliar',
    create: 'criar',
  },
  'es-ES': {
    central: 'ENUNCIADO CENTRAL',
    chapter: 'CAPÍTULO',
    takeaway: 'CONCLUSIÓN EDITORIAL:  ',
    source: 'Fuente / Crédito: {c}',
    join: '{f}  •  Crédito: {c}',
    vignette: 'VIÑETA CLÍNICA',
    findings: 'HALLAZGOS CLÍNICOS & PRUEBAS',
    reasoning: 'JUICIO DIAGNÓSTICO & RAZONAMIENTO',
    diagnosis: 'DIAGNÓSTICO DEFINITIVO',
    pearl: 'PERLA CLÍNICA',
    objectives: 'OBJETIVOS DE APRENDIZAJE',
    glossary: 'GLOSARIO',
    reading: 'LECTURA DE LOS DATOS',
    shared: 'COMPARTIDO',
    house: 'DEBATE',
    verdict: 'VEREDICTO DEL MODERADOR:',
    tutorial: 'PREGUNTA TUTORIAL',
    viva: 'EXAMEN ORAL',
    model_answer: 'RESPUESTA MODELO',
    examiner: 'NOTA DEL EXAMINADOR',
    clinical_use: 'USO CLÍNICO',
    origin: 'ORIGEN',
    modern_use: 'ACEPCIÓN ACTUAL',
    limitation: 'LIMITACIÓN',
    legacy: 'LEGADO',
    references: 'REFERENCIAS',
    tutor: 'TUTOR',
    student: 'ESTUDIANTE',
    marginalia: 'MARGINALIA',
    remember: 'recordar',
    understand: 'comprender',
    apply: 'aplicar',
    analyze: 'analizar',
    evaluate: 'evaluar',
    create: 'crear',
  },
  'en-US': {
    central: 'CENTRAL STATEMENT',
    chapter: 'CHAPTER',
    takeaway: 'EDITORIAL TAKEAWAY:  ',
    source: 'Source / Credit: {c}',
    join: '{f}  •  Credit: {c}',
    vignette: 'CLINICAL VIGNETTE',
    findings: 'CLINICAL FINDINGS & TESTS',
    reasoning: 'DIAGNOSTIC REASONING & JUDGMENT',
    diagnosis: 'DEFINITIVE DIAGNOSIS',
    pearl: 'CLINICAL PEARL',
    objectives: 'LEARNING OBJECTIVES',
    glossary: 'GLOSSARY',
    reading: 'READING THE DATA',
    shared: 'SHARED',
    house: 'DEBATE',
    verdict: "MODERATOR'S VERDICT:",
    tutorial: 'TUTORIAL QUESTION',
    viva: 'ORAL EXAM',
    model_answer: 'MODEL ANSWER',
    examiner: "EXAMINER'S NOTE",
    clinical_use: 'CLINICAL USE',
    origin: 'ORIGIN',
    modern_use: 'MODERN MEANING',
    limitation: 'LIMITATION',
    legacy: 'LEGACY',
    references: 'REFERENCES',
    tutor: 'TUTOR',
    student: 'STUDENT',
    marginalia: 'MARGINALIA',
    remember: 'remember',
    understand: 'understand',
    apply: 'apply',
    analyze: 'analyze',
    evaluate: 'evaluate',
    create: 'create',
  },
}

let ui: StudyLang = 'pt-BR'

export function setUi(lang: StudyLang | undefined): StudyLang {
  ui = lang && lang in LABELS ? lang : 'pt-BR'
  return ui
}

export function T(key: string): string {
  return LABELS[ui][key] ?? key
}

export function bloom(key: string): string {
  return LABELS[ui][String(key).toLowerCase()] ?? key
}

/** Wrong-language calques → target form. Scientific shared terms are never listed. */
const DRIFT: Record<StudyLang, Record<string, string>> = {
  'pt-BR': {
    desarrollo: 'desenvolvimento',
    desarrollar: 'desenvolver',
    estudio: 'estudo',
    el: 'o',
    la: 'a',
    los: 'os',
    las: 'as',
    del: 'do',
    más: 'mais',
    también: 'também',
    the: 'o/a',
    and: 'e',
    with: 'com',
    from: 'a partir de',
    this: 'este',
    that: 'esse',
    which: 'que',
  },
  'es-ES': {
    desenvolvimento: 'desarrollo',
    desenvolver: 'desarrollar',
    aprendizagem: 'aprendizaje',
    também: 'también',
    mais: 'más',
    patologia: 'patología',
    fisiopatologia: 'fisiopatología',
    tratamento: 'tratamiento',
    clinico: 'clínico',
    referencias: 'referencias',
  },
  'en-US': {
    desarrollo: 'development',
    patologia: 'pathology',
    clinico: 'clinical',
    tratamiento: 'treatment',
    diagnóstico: 'diagnosis',
    aprendizagem: 'learning',
  },
}

function escapeRe(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** [(calque, correction)] of wrong-language words in `text`. Word boundaries are Unicode. */
export function driftHits(text: string, lang: StudyLang): { word: string; fix: string }[] {
  const table = DRIFT[lang] ?? DRIFT['pt-BR']
  if (!text) return []
  const hits: { word: string; fix: string }[] = []
  for (const [word, fix] of Object.entries(table)) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(word)}(?![\\p{L}\\p{N}_])`, 'iu')
    if (re.test(text)) hits.push({ word, fix })
  }
  return hits
}
