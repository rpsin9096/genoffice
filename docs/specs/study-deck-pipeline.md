# Spec: pipeline StudyDeck **v3** no GenOffice

Fonte de verdade: `rpsin9096/slide-repo-v1` branch **`v3`**, arquivo **`study-deck 3.zip`** (não o `study-deck.zip` da `main`).

A `main` é o motor de 35 módulos + WCAG. O zip 3 é o mesmo motor **depois** do refactor de layout adaptativo: densidade medida (`tier_for` STANDARD/COMPACT), caixas reais (`fit_pt`), lint de prosa Layer B (`style.py`), oráculos visuais e pipeline que não relê o manifest.

Objetivo: o GenOffice entregar aulas **nesse** nível — e só então aposentar o renderer python-pptx. Autoria (módulos, contratos, estilo) não se aposenta.

## 0. Correção de rumo

O spec anterior foi escrito contra o zip da `main`. O que faltava, e é o “nível” que você quer copiar:

| Peça (só no 3.zip / v3) | O que faz |
|---|---|
| `studydeck/style.py` | Layer B: bloqueia muleta, metáfora, vago, rabo de particípio, termo clínico figurado |
| `geometry.tier_for` / `STANDARD` / `COMPACT` | mede o conteúdo **uma vez**; se não cabe, um passo de tipo com piso 9.0 / 10.5 pt. Sem terceiro tier, sem re-render |
| `fit_pt` / `stack_typed` | o corpo cabe na caixa real; o motor **não disfarça overflow afinando a caixa** |
| `CONTENT_BAND_H = 4.95` | banda única; rodapé e caption têm gutter |
| `tests/test_density.py`, `test_fit_drift.py`, `test_style.py`, `test_pipeline.py` | oráculos: densidade, deriva de caixa, prosa, I/O do CLI |
| `SYSTEM_PROMPT.md` §7 | duas camadas léxicas + ciclo causal 15–40 palavras + teste do especialista |

GenOffice hoje cresce text box no builder. StudyDeck v3 **proíbe** isso. Portar o renderer e deixar o grow ligado é regressão, não paridade.

## 1. Veredito

O LLM **não coloca x**. Também **não escolhe tier**. Densidade é medida no compiler (`tier_for`). O LLM preenche campos a ~90% do teto, no estilo Layer A/B; o motor desenha.

Não use o pipeline de marketing do GenOffice (`cover_typography_hero`, `three_column_cards`) para aula. Compile os 35 módulos.

## 2. O que o 3.zip realmente faz

```
source
  → ingest
  → curva pedagógica (`when`, não receita)
  → manifesto Python (COURSE_INFO, CONFIG, SLIDES)
  → lint: contrato + i18n + Layer B (style.py) + fit 1.06
  → render: header/footer + módulo
       ↳ geometry.stack / stack_typed: STANDARD ou COMPACT
       ↳ ContrastGate: WCAG AA ou o .pptx é apagado
  → CLI `all` carrega 1×, linta 1×, renderiza 1×  (test_pipeline)
```

Invariantes que **bloqueiam**:

1. Contraste ≥ 4.5:1 (3.0:1 display).
2. Deriva de idioma + **STYLE_*** (crutch / metaphor / vague / tail / literal).
3. Contrato: required, cardinalidade, teto de caracteres, caption+credit.
4. Fit: texto vs caixa real; COMPACT se STANDARD estoura; se ainda estoura, **reporta**, não inventa um 3º tier.
5. Paleta UCP + Montserrat, sem alternativa.
6. Imagem não é baixada. Painel rotulado para `https://` / `ai:` / `placeholder:`.

Lienzo: 13.333″ × 7.500″ = 1280×720. Safe zone assimétrica (0.650 / borda 12.65) é **canônica**. `CONTENT_BOTTOM = 6.60`, `FOOTER_Y = 6.98`.

Golden: `examples/ejemplo_inflamacao.py` (10 slides, lint PASS).

## 3. O que o GenOffice já faz (e o que atrapalha)

Reaproveitar:

- canvas 1280×720 e page-spec (`shape` / `text` / `image`)
- `slides check` / `audit` (geometria, overlap, overflow)
- `create --type pptx --spec` + `slides replace`
- BYOK (OpenCode / 9Router) para o estágio de fill

**Não** reaproveitar como está:

- `LAYOUT_VARIANTS` de consultoria
- grow de text box no builder (conflita com `fit_pt` / “não disfarça overflow”)
- audit só geométrico — falta WCAG na gravação e Layer B no lint
- LLM colocando elementos no canvas

## 4. Pipeline alvo

```
source → ingest → outline de módulos (`when`)
      → fill (LLM / OpenCode / 9Router)  ~90% do teto, Layer A/B
      → lint   contratos + i18n + style.py
      → compiler   módulo → page-spec
                   ↳ tier_for(texts, box_w, size, CONTENT_BAND_H)
                   ↳ STANDARD ou COMPACT; nunca um 3º tier
                   ↳ LLM não coloca x
      → WCAG gate  recusa create se ratio < AA
      → genoffice create --spec + slides audit
      → oráculo visual (PNG/SVG 16:9, pisos de tipo)
```

Manifesto no GenOffice: **JSON** (CLI é Node), mesmo shape semântico do Python.

```json
{
  "course": { "course": "Fisiopatologia", "institution": "UCP" },
  "config": { "lang": "pt-BR", "profile": "short",
              "images": { "mode": "web-only", "max_n": "auto" } },
  "slides": [{ "module": "definition", "kicker": "Conceito", "title": "…",
               "main_statement": "…", "key_points": [] }]
}
```

Preset `style.md` = `study-ucp`. Paleta não é do LLM.

## 5. Compiler — paridade v3, não “um JSON bonito”

Entrada: dict de módulo pós-lint. Saída: page-spec.

- `px = round(inches * 96)`. Safe zone e `CONTENT_BAND_H` iguais ao 3.zip.
- `tier_for` no TypeScript com os mesmos `STANDARD = {gap:0.16, pad:0.25, cap:1.20, scale:1}` e `COMPACT = {gap:0.10, pad:0.18, cap:null, scale:0.94}`.
- Pisos: `TYPE_FLOOR_PT = 9.0`, `BODY_FLOOR_PT = 10.5`. COMPACT dá **um** passo de tipo, nunca abaixo do piso.
- Cores só de tokens UCP; o compiler pinta o texto (como `palette.py`).
- Header/footer gerados, não campos do LLM.
- Grow do builder GenOffice: **desligado** no modo study (caixa do compiler é a caixa final; overflow = falha de lint, não stretch).
- Golden: inflamação compilada vs PPTX/SVG do 3.zip. Densidade e hierarquia, não pixel-perfect de hinting.

## 6. Papel do LLM

Só ingest + escolha de `when` + fill. Autocorreção contra lint `--json` (incluindo `STYLE_*`).

Não: x/y, hex, tier, número ausente na fonte, `image` sem caption+credit, prosa Layer B.

O `SYSTEM_PROMPT.md` do 3.zip é o prompt do skill; troca-se `studydeck all` por `genoffice study lint|compile` + `create --spec`.

## 7. Fases (refeitas contra o 3.zip)

### Fase 0 — Um módulo, os dois tiers

`definition` esparso (STANDARD) e denso (COMPACT, o `DENSE` de `test_density.py`).

CHECK: `tier_for` escolhe o tier certo; page-spec não overflow; WCAG AA; olho vs slide 4 do exemplo de inflamação.

Se STANDARD/COMPACT não aparecer no JSON, o compiler está errado.

### Fase 1 — Os 10 slides de `ejemplo_inflamacao.py`

Portar `contracts.py` B + REQUIRED + `style_hits` + i18n.

```
genoffice study lint manifest.json --json
genoffice study compile manifest.json --out deck/pages
genoffice create --type pptx --spec deck/pages --out aula.pptx
```

`all` carrega 1× / linta 1× (paridade `test_pipeline.py`).

### Fase 2 — 35/35 + oráculos v3

Fixtures, pegadinhas, `test_fit_drift` equivalente (caixa = texto medido), visual 16:9, tokens sem hex solto.

### Fase 3 — Modo Aula no Slides (BYOK já spec’d)

Painel: material → curva → lint Layer B visível → build. Sem outline de marketing.

### Fase 4 — Aposentar python-pptx do 3.zip

**Neste repo (GenOffice) o critério está fechado:** 35/35 + inflamação + skill
OpenCode no fluxo `lint → compile → create` / `study all`, com `tier_for` e
`STYLE_*` verdes. O **runtime** da aula é `genoffice study`. O 3.zip / StudyDeck
é **referência de contratos**, não runtime: `python-pptx` não escreve o `.pptx`.

## 8. ADRs

**ADR-S1** — Compiler; o LLM não coloca x (e não escolhe COMPACT).
**ADR-S2** — JSON manifesto, não `exec` de Python no Electron.
**ADR-S3** — Paleta UCP é preset v1; módulos aceitam outro preset depois, nunca paleta por slide.
**ADR-S4** — WCAG na gravação + Layer B no lint. `slides audit` sozinho não é o 3.zip.
**ADR-S5** — Outline de study (`module`) ≠ outline de marketing (`cover|content|data`).
**ADR-S6** — No modo study, **não crescer** text box. Overflow é falha. Isso é a tese do 3.zip (`el motor no disimula un desborde`).
**ADR-S7** — Densidade: uma medida, dois tiers. Sem retry, sem 3º tier, sem re-render.

## 9. Riscos específicos do 3.zip

- Métrica Montserrat no GenOffice ≠ `est_height` do python-pptx. Portar o estimador ou medir com o font-store; senão COMPACT dispara no lugar errado.
- Safe zone assimétrica: replicar 12.65, não “consertar”.
- GenOffice baixar `https://` no builder quebra a política de imagem. Modo study: painel rotulado, igual ao 3.zip.
- Layer B é clínica (UCP). Fora de medicina, `ALLOW_TERMS` e famílias por `LANG` — não desligar o guard.
- Um deck GenOffice “mais vazio e mais bonito” é regressão de densidade.

## 10. Arquivos (quando implementar)

```
packages/pipelines/src/slides/study/
  modules.ts          # 35 + when
  contracts.ts        # B, REQUIRED, FIT (port do 3.zip)
  style.ts            # Layer B = style.py
  geometry.ts         # tier_for, STANDARD, COMPACT, fit_pt, band 4.95
  lint.ts
  compile.ts          # módulo → PageSpec; LLM não coloca x
  palette-ucp.ts
  contrast.ts
  fixtures/
packages/cli/src/commands/study.ts
skills/genoffice-study/SKILL.md   # SYSTEM_PROMPT do 3.zip
```

Não alargar `LAYOUT_VARIANTS`. Não tocar `ai-provider`.

## 11. Recomendação

1. Paridade é com **`study-deck 3.zip` / branch v3**, não com a main.
2. Fase 0 = `definition` STANDARD e COMPACT. Sem os dois tiers, não há v3.
3. OpenCode/9Router só no fill; sem compiler+`tier_for`+Layer B, BYOK gera o mesmo deck de marketing de sempre.

## 12. Próximo passo

Fase 0: `tier_for` + `compileDefinition()` em `packages/pipelines`, golden do slide 4 da inflamação e do caso DENSE de `test_density.py`.
