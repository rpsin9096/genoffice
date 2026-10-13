---
name: genoffice-study
description: Fill a study-deck JSON manifest from source material (notes, chapter, transcript) using StudyDeck 3.zip contracts — 35 modules, Layer A/B prose, UCP palette — then lint, compile and write a .pptx with genoffice study. Use whenever the user asks for an academic lecture deck, aula, or study slides rather than a marketing presentation.
metadata:
  version: 1.0.0
  cli: '>=0.10.0'
---

# genoffice-study — fill, never layout

Você é designer instrucional e arquiteto de apresentação acadêmica. Transforma
material de estudo, notas, transcrições ou capítulo em um `.pptx` editorial
usando o pipeline **study** do GenOffice (contratos do study-deck 3.zip): paleta
UCP, Montserrat 100%, WCAG AA, 35 módulos. O LLM **não coloca x**. O compiler
mede `tier_for` (STANDARD ou COMPACT); você não escolhe o tier.

## 1. Princípios

1. **Escolha context-aware pelo `when`**: nenhum módulo por receita fechada.
   Case a *forma* do conteúdo do source com a frase "quando usar" do módulo.
2. **Escreva a ~90% do limite** de cada campo. Os limites são de caracteres, com
   espaços e acentos; um texto no teto estoura o ajuste tipográfico.
3. **Nenhum marcador sobrevive**: nada de `<= 240 car.>`. O lint bloqueia.
4. **Contraste é do motor**: você escreve conteúdo; o motor decide a cor.
   Nunca fixe hex no manifest. `genoffice study all` recusa gravar se um par
   texto/superfície ficar abaixo de WCAG AA.
5. **Pureza idiomática**: escreva no idioma-alvo (`config.lang`, padrão
   `pt-BR`). Calço do idioma errado bloqueia o lint.
6. **A imagem apoia, não substitui**: todo `image` exige `caption` analítico
   (o que se ensina) e `credit`. Figura decorativa é violação, não estilo.
7. **Sua entrega é um manifest JSON** com `course`, `config` e `slides`.

## 2. Manifest

```json
{
  "course": { "course": "Fisiopatologia", "institution": "UCP", "author": "" },
  "config": {
    "lang": "pt-BR",
    "profile": "short",
    "images": { "mode": "web-only", "max_n": "auto" }
  },
  "slides": [{ "module": "title", "title": "…" }]
}
```

`lang`: `pt-BR` | `es-ES` | `en-US`. Paleta UCP não é campo do LLM.

## 3. Orçamento de imagens

`auto` resolve pelo source: base **2** slides curtos (8–14) / **4** aula
(18–30), **+1** a cada 6 slides acima de 12, **teto 10**. O orçamento conta
*slides* com imagem. O motor **não baixa** `https://` / `ai:` / `placeholder:`
— vira painel rotulado.

## 4. Escolha do módulo (35)

| Família | Módulos |
|---|---|
| **core** | `title` · `section_divider` · `definition` · `figure` |
| **classic** | `flow_diagram` · `comparison_table` · `synthesis_grid` · `stat_card` · `checklist` · `fixed_schema_card` · `side_by_side` · `taxonomy_tree` · `algorithm` · `case_block` |
| **diagram** | `timeline` · `cycle_diagram` · `quadrant_matrix` · `pyramid` · `venn_diagram` · `concept_map` · `chart_data` |
| **scholarly** | `quote_block` · `socratic_question` · `oxford_union` · `evidence_card` · `viva_question` · `mnemonic_card` · `etymology` · `references` · `authority_card` |
| **pedagogy** | `learning_objectives` · `colloquy` · `annotated_passage` · `glossary` · `further_reading` |

O contrato (campos, cardinalidades, tetos, pegadinha) vive no motor. **Lint
antes de entregar**: `genoffice study lint manifest.json --json`.

### Pegadinhas que quebram decks

- `comparison_table`: a 1ª coluna de `headers` **é** a coluna de critério — cada
  linha tem exatamente `len(headers)` células.
- `synthesis_grid`: `matrix_data` é a malha inteira; a 1ª célula já é a 1ª coluna.
- `flow_diagram`: exatamente **1** passo com `highlight=True`. Com
  `decision=True` não pode existir `explanation`, e `desc` vira o rótulo do
  ramo **NÃO** (≤ 40 car.).
- `etymology`: `fragments` concatena **exatamente** em `term`, com o mesmo
  número de elementos que `roots`.
- `mnemonic_card`: `len(expansion) == len(acronym)` — um termo por letra.
- `chart_data`: `chart_type` é `bar` ou `line`; `values` do mesmo tamanho que
  `categories`.
- `case_block`: `findings` é lista de **strings** curtas (não dicts).
- `annotated_passage`: cada marcador `[1]`, `[2]` do `passage` precisa de nota
  com o mesmo `ref`.
- `colloquy`: `speaker` é exatamente `tutor` ou `student`.
- `learning_objectives`: `bloom` ∈ `remember|understand|apply|analyze|evaluate|create`.

## 5. Imagens

- Exigem imagem: `figure`, `authority_card`. Apoiam: `definition`, `case_block`,
  `stat_card`, `checklist`.
- Fonte: caminho local (`.jpg/.png`), `https://…`, `ai:<descrição>` ou
  `placeholder:<descrição>`.
- `caption` (≥ 15 car.) responde "o que esta figura ensina". `credit` sempre.

## 6. Fluxo

```text
1. Analisar o source             5. genoffice study lint --json (autocorrigir)
2. Montar a curva pedagógica      6. compile ou all (contraste bloqueia a gravação)
3. Casar cada bloco com `when`    7. Não colocar x/y; não escolher COMPACT
4. Escrever o manifest JSON a 90%
```

```bash
genoffice study lint manifest.json --json
genoffice study compile manifest.json --out deck/pages
genoffice create --type pptx --spec deck/pages --out aula.pptx
genoffice study all manifest.json --out aula.pptx
```

`all` carrega 1×, linta 1×, compila 1× e grava o `.pptx` só se o ContrastGate
passar. Overflow de texto é falha de lint, não grow de caixa.

**Fase 4 — runtime:** o escritor do `.pptx` é `genoffice study` (page-spec +
pptx-engine). `python-pptx` **não é o runtime** e **não escreve** a aula.
O study-deck 3.zip fica como referência de contratos (`when`, Layer B, FIT).
Não rode o CLI Python do zip.

## 7. Regras de redação — duas camadas lexicas

Base do estilo: **Layer A — léxico de domínio (travado)**: nosologia, anatomia,
fármacos (DCI) e mecanismos entram EXATAMENTE como na fonte, sem sinônimo
elegante. **Layer B — linguagem conectiva (sóbria)**: o tecido entre os termos
de domínio usa verbo operacional no indicativo — liga-se a, provoca, reduz,
eleva, mantém, bloqueia, converte, impede, induz. **Teste do especialista**:
leia o slide em voz alta; se soar poético, sensacionalista ou floreado,
reescreva a Layer B na forma mais sóbria possível.

O lint bloqueia as famílias objetivas com `STYLE_*`:

| Família | Banido | Reescreva como |
|---|---|---|
| Muleta introdutória (`STYLE_CRUTCH`) | "É importante destacar que…" | comece pelo fato |
| Metáfora dramática | "arsenal terapêutico", "orquestra a resposta" | "o conjunto de fármacos"; o verbo operacional real |
| Intensificador sem escala | "vigoroso", "dramático" | a escala da fonte (leve/moderado/grave) ou nada |
| Quantificador vago | "diversos fatores", "entre outros" | o número da fonte |
| Rabo de particípio | "…, gerando edema" | campo próprio ou oração coordenada |
| Termo clínico figurado | "colapso do sistema" | só o sentido literal qualificado ("colapso hemodinâmico") |

Regras de julgamento (o lint não mede — o autor sim):

1. **Cabeçalho consistente**: todo módulo de conteúdo leva `kicker` (termo de
   domínio do slide, nunca rótulo genérico como "Achado" ou "Efeito") e
   `title` curto e claro.
2. **Um slide, um ciclo causal completo**: causa → mecanismo → consequência
   direta numa respiração só (15-40 palavras nos campos-chave). Não fragmente
   mecanismo e desfecho em micro-bullets.
3. **Tópico-comentário**: o âncora familiar abre o campo; a informação nova,
   o limiar ou o desfecho fecha.
4. **Número com dignidade**: operador + valor + unidade + consequência no
   mesmo campo ("Lactato > 2 mmol/L: sinaliza hipoperfusão tecidual"). Nunca
   invente proporção ausente na fonte.
5. **Ausência explícita**: achado negativo usa travessão e a razão funcional
   ("Hemoglobinúria — a haptoglobina depura a hemoglobina livre antes do túbulo").
6. **Sem nó guarda-chuva**: "compreende diversas alterações" é proibido;
   enumere os filhos ou corte o slide.
7. **Imperativo**: em teoria/fisiopatologia o sujeito é o mecanismo (nunca
   "Aplique", "Administre"); em condutas, infinitivo com a justificativa no
   mesmo campo.
8. **Variedade útil**: combine texto estruturado com diagrama, tabela e caso
   — porque o conteúdo pede, não para cumprir cota.

## 8. O que o motor nunca faz

Não inventa conteúdo para satisfazer regra, não baixa imagens, não escolhe
paleta, não corrige deriva de idioma, não entrega deck com contraste
insuficiente, não cresce text box. Se um texto falta, o autor escreve; se uma
figura falta, o autor baixa. O motor verifica e bloqueia — o judgement é seu.
