/** Advisory guides + 4-slide JSON scaffold (3.zip scaffold.py). JSON, not exec. */
import type { StudyLang, StudyManifest, StudySlide } from './types'

export const GUIDES = {
  lecture: {
    length: '18-30 slides',
    hint:
      'abre con learning_objectives si o source enumera metas; un section_divider por bloco tematico; processo->flow_diagram/cycle_diagram; comparacao->comparison_table/side_by_side; evolucao->timeline; fecha com case_block o viva_question + further_reading',
  },
  short: {
    length: '8-14 slides',
    hint: 'definition+figure cedo; um bloco central conforme a forma do source (flow|table|timeline|case); fecha com checklist ou further_reading',
  },
  custom: {
    length: 'livre',
    hint: 'escolha cada modulo pelo seu `when`; title + section_divider bastam de base',
  },
} as const

export type StudyGuide = keyof typeof GUIDES

const EXAMPLES: StudySlide[] = [
  {
    module: 'title',
    title: 'Exemplo: inflamacao aguda',
    subtitle: 'Do estimulo lesivo a resolucao do tecido',
    course: 'Nome da disciplina',
    institution: 'Nome da instituicao',
  },
  {
    module: 'section_divider',
    section_title: 'Exemplo: a resposta inflamatoria',
    section_subtitle:
      'Vasodilatacao, aumento da permeabilidade e migracao leucocitaria formam uma sequencia coordenada.',
  },
  {
    module: 'definition',
    kicker: 'Conceito',
    title: 'Exemplo: inflamacao aguda',
    main_statement:
      'Resposta vascular estereotipada do tecido vivo diante da lesao, orientada a neutralizar o agente e reparar o dano.',
    key_points: [
      {
        title: 'Fase vascular',
        desc: 'Vasodilatacao e aumento da permeabilidade produzem rubor, calor e edema.',
      },
      {
        title: 'Fase celular',
        desc: 'Neutrofilos chegam primeiro; monocitos conduzem a reparacao.',
      },
    ],
  },
  {
    module: 'checklist',
    kicker: 'Pratica',
    title: 'Exemplo: verificacao do primeiro atendimento',
    items: [
      {
        label: 'Confirmar sinal vital alterado',
        desc: 'Registrar hora do primeiro registro e tendencia.',
      },
      {
        label: 'Solicitar exames guiados',
        desc: 'Pedir apenas o que muda a conduta imediata.',
      },
    ],
  },
]

export function isStudyGuide(name: string): name is StudyGuide {
  return name in GUIDES
}

export function scaffoldManifest(
  profile: StudyGuide = 'short',
  lang: StudyLang = 'pt-BR',
): StudyManifest & { config: { lang: StudyLang; profile: StudyGuide } } {
  return {
    course: { course: 'Nome da disciplina', institution: 'Nome da instituicao', author: '' },
    config: { lang, profile },
    slides: EXAMPLES.map((s) => ({ ...s })),
  }
}
