/** Context-aware `when` copy from study-deck 3.zip `registry.WHEN`. */
import type { StudySlide } from './types'

export const WHEN: Record<StudySlide['module'], string> = {
  title: 'toda apresentacao: capa com curso, titulo e subtitulo',
  section_divider: 'transicao entre blocos tematicos do source; da ritmo em decks longos',
  definition: 'a tese central que o deck desenvolve + pontos-chave; vai no inicio',
  figure:
    'ha uma imagem REAL que desenvolve conteudo (histologia, esquema do source, imagem clinica)',
  flow_diagram: 'processo linear de 3-4 passos; passos com decision=True ramificam (sim/nao)',
  comparison_table: 'comparar opcoes/criterios: 3-4 colunas x 3-4 linhas',
  synthesis_grid: 'malla densa 3x3 de relacoes (matriz-resumo de uma secao)',
  stat_card: 'UM numero do source merece protagonismo + blocos narrativos de apoio',
  checklist: 'protocolo ou lista de verificacao acionavel (passos a seguir na pratica)',
  fixed_schema_card: 'entidade com campos fixos label->valor (criterios diagnosticos, ficha)',
  side_by_side: 'dicotomia A vs B com pontos de cada lado',
  taxonomy_tree: 'classificacao hierarquica: raiz + 2-3 categorias com exemplos',
  algorithm: 'cascata numerada de decisoes ou procedimentos',
  case_block:
    'caso/vinheta com achados, raciocinio, diagnostico e perola — fecha bem um tema',
  quote_block: 'citacao textual relevante com autor e contexto',
  timeline: 'evolucao temporal, fases ou marcos (3-5): historia natural, etapas, cronologia',
  cycle_diagram: 'processo ciclico fechado de 3-6 nos (retroalimentacao)',
  quadrant_matrix: 'matriz 2x2 com eixos (decisao bidimensional, classificacao)',
  pyramid: 'hierarquia de niveis (3-5) onde a base sustenta o topo',
  socratic_question:
    'pergunta tutorial com andaime de raciocinio numerado — autoestudo',
  oxford_union: 'debate pro/contra sobre uma mocai com veredito (temas controvertidos)',
  evidence_card: 'um estudo/paper chave: PICO + efeito principal + limitacao',
  viva_question:
    'pergunta de prova oral com resposta-modelo e nota do examinador — revisao ativa',
  mnemonic_card: 'regra mnemotecnica tipo acronimo (um termo por letra)',
  etymology: 'deconstrucao de um termo em suas raizes (grego/latino)',
  venn_diagram: 'sobreposicao de 2-3 conjuntos com zona compartilhada',
  chart_data: 'dados numericos comparaveis (grafico nativo editavel) + painel de leitura',
  references: 'bibliografia numerada em duas colunas',
  authority_card: 'autor/figura com retrato real + biografia + legado',
  learning_objectives: 'objetivos de aprendizagem com verbo Bloom — abre decks de aula',
  colloquy: 'dialogo tutor/estudante alternado (tutoria socratica)',
  annotated_passage: 'texto-fonte primario com notas marginais numeradas [1] [2]',
  concept_map: 'conceito central com 4-6 satelites radiais',
  glossary: 'terminologia-chave com definicoes breves (4-10 termos)',
  further_reading: 'leituras graduadas por dificuldade para aprofundar',
}

export function whenFor(module: StudySlide['module']): string {
  return WHEN[module]
}
