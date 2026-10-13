import { describe, expect, it } from 'vitest'
import { compileSlide } from '../src/slides/study/compile'
import { lintDeck } from '../src/slides/study/lint'
import { parseStudyManifest } from '../src/slides/study/manifest'
import type { StudySlide } from '../src/slides/study/types'

const opts = { course: 'Fisiopatologia', index: 11 }

const QUOTE = {
  module: 'quote_block' as const,
  title: 'Epígrafe',
  quote: 'A inflamação aguda é a resposta imediata do tecido vascularizado a um estímulo lesivo.',
  author: 'Robbins',
  source: 'Pathologic Basis of Disease',
  year: '2018',
  context: 'Abre o capítulo de inflamação aguda.',
}

const SOCRATIC = {
  module: 'socratic_question' as const,
  title: 'Tutoria',
  question: 'Por que o edema inflamatório é rico em proteína?',
  context: 'Compare transudato e exsudato no endotélio lesado.',
  scaffold: [
    'A histamina abre as junções endoteliais.',
    'O exsudato segue o gradiente osmótico.',
  ],
  reading: 'Robbins cap. 3',
}

const OXFORD = {
  module: 'oxford_union' as const,
  title: 'Moção',
  motion: 'A inflamação crônica é sempre deletéria.',
  pro_card: {
    title: 'Proposição',
    points: ['Fibrose substitui parênquima.', 'O estímulo persiste por meses.'],
  },
  con_card: {
    title: 'Oposição',
    points: ['Granuloma contém o bacilo.', 'A cicatriz restaura continência.'],
  },
  verdict: 'Depende do estímulo e da duração.',
}

const EVIDENCE = {
  module: 'evidence_card' as const,
  title: 'Ensaio',
  study_name: 'CANTOS',
  design: 'RCT',
  year: '2017',
  population: 'Adultos com IAM prévio',
  intervention: 'Canacinumabe',
  comparison: 'Placebo',
  outcome: 'Eventos cardiovasculares',
  effect: 'HR 0.85',
  effect_desc: 'Redução de eventos',
  limitation: 'Infecções fatais aumentaram.',
  credit: 'Ridker 2017',
}

const VIVA = {
  module: 'viva_question' as const,
  title: 'Prova oral',
  prompt: 'Descreva a sequência celular nas primeiras 72 horas.',
  model_answer: 'Neutrófilos predominam até 24 h; macrófagos sucedem após 48 h.',
  examiner_note: 'Exija a troca celular, não só a lista de células.',
  difficulty: 'médio',
}

const MNEMONIC = {
  module: 'mnemonic_card' as const,
  title: 'Sinais cardinais',
  acronym: 'CART',
  expansion: ['Calor', 'Algia', 'Rubor', 'Tumor'],
  usage: 'Sinais cardinais da inflamação aguda.',
  domain: 'Patologia',
}

const ETYMOLOGY = {
  module: 'etymology' as const,
  title: 'Etimologia',
  term: 'Apendicite',
  fragments: ['Apendic', 'ite'],
  roots: [
    { part: 'Apendic', origin: 'latim', meaning: 'apêndice cecal' },
    { part: 'ite', origin: 'grego', meaning: 'inflamação' },
  ],
  modern: 'Inflamação do apêndice cecal.',
}

const REFS = {
  module: 'references' as const,
  title: 'Bibliografia',
  refs: [
    'Kumar V. Robbins. 10 ed. 2018.',
    'Ridker PM. CANTOS. N Engl J Med. 2017.',
    'Medzhitov R. Origin of inflammation. 2008.',
  ],
}

const AUTHORITY = {
  module: 'authority_card' as const,
  title: 'Autoridade',
  image: 'placeholder:Virchow',
  name: 'Rudolf Virchow',
  dates: '1821–1902',
  epithet: 'Patologia celular',
  bio: 'Formulou que toda célula deriva de outra célula e descreveu a trombose.',
  legacy: 'Tríade de Virchow ainda estrutura a trombose.',
  caption: 'Retrato de Rudolf Virchow.',
  credit: 'Wellcome Collection',
}

const COLLOQUY = {
  module: 'colloquy' as const,
  title: 'Diálogo',
  turns: [
    { speaker: 'tutor', text: 'Qual célula chega primeiro ao foco?' },
    { speaker: 'student', text: 'O neutrófilo, nas primeiras horas.' },
    { speaker: 'tutor', text: 'E depois de 48 horas?' },
    { speaker: 'student', text: 'O macrófago sucede o neutrófilo.' },
  ],
}

const PASSAGE = {
  module: 'annotated_passage' as const,
  title: 'Fonte',
  passage: 'Celsus descreveu calor, rubor, tumor e dolor [1] como signos da inflamação [2].',
  source: 'De Medicina, séc. I',
  annotations: [
    { ref: '1', note: 'Quatro signos cardinais clássicos.' },
    { ref: '2', note: 'O quinto signo, functio laesa, é de Galeno/Virchow.' },
  ],
}

const ALL = [
  QUOTE,
  SOCRATIC,
  OXFORD,
  EVIDENCE,
  VIVA,
  MNEMONIC,
  ETYMOLOGY,
  REFS,
  AUTHORITY,
  COLLOQUY,
  PASSAGE,
]

describe('scholarly module batch (3.zip)', () => {
  it('compiles quote_block with attribution', () => {
    const { page } = compileSlide(QUOTE as StudySlide, opts)
    expect(page.layout).toBe('study_quote_block')
    expect(JSON.stringify(page)).toContain('tecido vascularizado')
    expect(JSON.stringify(page)).toContain('ROBBINS')
  })

  it('compiles socratic_question with scaffold', () => {
    const { page } = compileSlide(SOCRATIC as StudySlide, opts)
    expect(page.layout).toBe('study_socratic_question')
    expect(JSON.stringify(page)).toContain('PERGUNTA DE TUTORIA')
    expect(JSON.stringify(page)).toContain('histamina')
  })

  it('compiles oxford_union motion and verdict', () => {
    const { page } = compileSlide(OXFORD as StudySlide, opts)
    expect(page.layout).toBe('study_oxford_union')
    expect(JSON.stringify(page)).toContain('DEBATE')
    expect(JSON.stringify(page)).toContain('VEREDITO')
    expect(JSON.stringify(page)).toContain('Granuloma')
  })

  it('compiles evidence_card PICO plus effect', () => {
    const { page } = compileSlide(EVIDENCE as StudySlide, opts)
    expect(page.layout).toBe('study_evidence_card')
    expect(JSON.stringify(page)).toContain('CANTOS')
    expect(JSON.stringify(page)).toContain('HR 0.85')
    expect(JSON.stringify(page)).toContain('LIMITAÇÃO')
  })

  it('compiles viva_question prompt and examiner note', () => {
    const { page } = compileSlide(VIVA as StudySlide, opts)
    expect(page.layout).toBe('study_viva_question')
    expect(JSON.stringify(page)).toContain('PROVA ORAL')
    expect(JSON.stringify(page)).toContain('RESPOSTA MODELO')
    expect(JSON.stringify(page)).toContain('NOTA DO EXAMINADOR')
  })

  it('compiles mnemonic_card letters and usage', () => {
    const { page } = compileSlide(MNEMONIC as StudySlide, opts)
    expect(page.layout).toBe('study_mnemonic_card')
    expect(JSON.stringify(page)).toContain('USO CLÍNICO')
    expect(JSON.stringify(page)).toContain('Calor')
  })

  it('compiles etymology fragments and roots', () => {
    const { page } = compileSlide(ETYMOLOGY as StudySlide, opts)
    expect(page.layout).toBe('study_etymology')
    expect(JSON.stringify(page)).toContain('Apendic')
    expect(JSON.stringify(page)).toContain('ORIGEM')
  })

  it('compiles references in numbered columns', () => {
    const { page } = compileSlide(REFS as StudySlide, opts)
    expect(page.layout).toBe('study_references')
    expect(JSON.stringify(page)).toContain('REFERÊNCIAS')
    expect(JSON.stringify(page)).toContain('CANTOS')
  })

  it('compiles authority_card portrait as a labeled panel', () => {
    const { page } = compileSlide(AUTHORITY as StudySlide, opts)
    expect(page.layout).toBe('study_authority_card')
    expect(JSON.stringify(page)).toContain('Rudolf Virchow')
    expect(JSON.stringify(page)).toContain('MARCADOR')
    expect(page.elements.some((el) => el.type === 'image')).toBe(false)
  })

  it('compiles colloquy tutor and student turns', () => {
    const { page } = compileSlide(COLLOQUY as StudySlide, opts)
    expect(page.layout).toBe('study_colloquy')
    expect(JSON.stringify(page)).toContain('neutrófilo')
    expect(JSON.stringify(page)).toContain('macrófago')
  })

  it('compiles annotated_passage with matching refs', () => {
    const { page } = compileSlide(PASSAGE as StudySlide, opts)
    expect(page.layout).toBe('study_annotated_passage')
    expect(JSON.stringify(page)).toContain('MARGINALIA')
    expect(JSON.stringify(page)).toContain('Celsus')
  })

  it('lints the eleven fixtures clean and rejects a short quote', () => {
    expect(lintDeck(ALL as StudySlide[])).toEqual([])
    expect(
      lintDeck([{ module: 'quote_block', title: 'X', quote: '', author: '' } as StudySlide]).some(
        (e) => e.includes('.quote') && e.includes('obrigatorio'),
      ),
    ).toBe(true)
  })

  it('parses all eleven in a study manifest', () => {
    const r = parseStudyManifest(
      JSON.stringify({ course: { course: 'Fisiopatologia' }, slides: ALL }),
    )
    expect(r.ok).toBe(true)
  })
})
