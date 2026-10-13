# Spec: portar o pipeline study para um fork futuro do GenOffice

Quando o upstream do GenOffice avançar, você **faz fork da versão nova** e
traz o study de **este** checkout — não reimplementa a partir do
`python-pptx` / `study-deck 3.zip`. O zip é **referência de contratos**.
O runtime é `genoffice study` (`lint → compile → create` / `study all`).

Este documento é o playbook de cópia. Leia junto com
`docs/specs/study-deck-pipeline.md` (invariantes) e
`skills/genoffice-study/SKILL.md` (o que o LLM pode escrever).

## 0. O que está sendo portado

Um motor de aula acadêmica **dentro** do GenOffice:

| Camada | Papel |
|---|---|
| `packages/pipelines/src/slides/study/` | contratos 35 módulos, Layer B, `tier_for`, compiler → page-spec |
| `packages/cli/src/commands/study.ts` | verbos CLI |
| `skills/genoffice-study/` | SYSTEM_PROMPT OpenCode (fill, never layout) |
| `apps/slides/src/renderer/ai/Aula*` | dock Aula no editor |

O LLM **não coloca x**. **Não escolhe tier**. **Não fixa hex**. Fill é BYOK.

## 1. Ordem de cópia (obrigatória)

Copie e faça o merge **nesta ordem**. Cada passo tem um check mínimo.
Não pule para a UI antes do compiler fechar.

### Passo A — pipelines (o motor)

Copie o diretório inteiro:

```
packages/pipelines/src/slides/study/
```

Arquivos que **têm** de existir (não cherry-pick um “mínimo”):

```
aula.ts          compile.ts       contracts.ts     contrast.ts
curve.ts         fill-poison.ts   fill.ts          fit-drift.ts
fixtures.ts      geometry.ts      i18n.ts          images.ts
imgprep.ts       ingest.ts        layer-b.ts       lint.ts
manifest.ts      modules.ts       painter.ts       palette-ucp.ts
scaffold.ts      schema.ts        style.ts         types.ts
visual.ts        when.ts
```

Fixture golden:

```
packages/pipelines/tests/fixtures/inflamacao.ts
packages/pipelines/tests/study-*.test.ts
```

Reexporte em `packages/pipelines/src/slides/index.ts` **por nome**,
como neste repo. **Não** faça `export *` de `compile.ts` (puxe só
`compileDeck` / `compileSlide` / tipos). `export *` de Spec* do compile
quebra o page-spec do builder.

Check A:

```
npm run test -w @genoffice/pipelines -- tests/study-geometry.test.ts tests/study-compile.test.ts tests/study-deck.test.ts tests/study-style.test.ts
```

`study-deck` = 10 páginas da inflamação. Sem isso, pare.

### Passo B — page-spec: study não cresce caixa (ADR-S6)

No fork, `packages/pipelines/src/slides/page-spec.ts` (ou o arquivo que
chama `growTextBoxesToContent`) **tem** de pular grow quando
`spec.layout` começa com `study_`:

```ts
const study = spec.layout?.startsWith('study_') === true
if (deps.fontMetrics && !study) {
  bytes = (await growTextBoxesToContent(bytes, deps.fontMetrics)) ?? bytes
}
```

Portar o compiler e deixar o grow ligado é regressão, não paridade.
Não alargue `LAYOUT_VARIANTS` de marketing. ADR-S5: `module`/`when` ≠
`cover|content|data`.

Check B: `tests/study-grow.test.ts` (overflow reporta; caixa não estica).

### Passo C — CLI

1. Copie `packages/cli/src/commands/study.ts`.
2. Registre em `packages/cli/src/cli.ts`:
   `import { studyCommand } from './commands/study'` e `.register(studyCommand)`.
3. Copie `packages/cli/tests/study*.test.ts`.
4. **help-sync** (senão o CI do CLI quebra):
   - cerca de exemplos no `packages/cli/README.md` com cada verbo
     `genoffice study …`
   - linha na tabela de `skills/genoffice/SKILL.md` com os mesmos verbos
   - bump da `metadata.version` do skill `genoffice` (neste repo: 2.79.0)
5. PDFium / `pdfText` **já mora no CLI** (`@genoffice/pdf2docx`). Não
   mova PDFium para `packages/pipelines`. `study ingest` de PDF chama
   `pdfText` no comando, não no motor.
6. MCP: `TOOLS` é lista **hardcoded**. Adicionar o comando CLI **não**
   adiciona tool MCP. `mcp.test.ts` afirma `tools.length === TOOLS.length`.
   Não “corrija” isso no porte.

Check C:

```
npm run test -w @genoffice/cli -- tests/study.test.ts tests/study-all.test.ts tests/study-check.test.ts tests/study-new.test.ts
```

`study check` tem de imprimir **35/35** e contraste PASS.

### Passo D — skill de fill (OpenCode)

Copie `skills/genoffice-study/` inteiro. Não aponte o agente para
`studydeck all` nem para o CLI Python do zip. O fluxo no skill é:

```
genoffice study lint manifest.json --json
genoffice study compile manifest.json --out deck/pages
genoffice create --type pptx --spec deck/pages --out aula.pptx
genoffice study all manifest.json --out aula.pptx
```

`python-pptx` **não é o runtime** e **não escreve** a aula.

Check D: `packages/cli/tests/study-skill.test.ts` e `tests/study-fase4.test.ts`.

### Passo E — dock Aula (opcional no primeiro dia, obrigatório para o editor)

Só depois de A–D verdes:

```
apps/slides/src/renderer/ai/AulaPanel.tsx
apps/slides/src/renderer/ai/StudyAulaShell.tsx
apps/slides/src/renderer/ai/aula-land.ts
apps/slides/tests/aula-*.test.ts
```

Wire em `apps/slides/src/renderer/App.tsx`:

- dock Chat | Aula; Aula **mantém** `AiPanel` montado
- `onAulaBuild` → `landAulaPages` (`localGeneratePage` + replace) → `applyDeck`

Check E: `npm run test -w @genoffice/slides -- tests/aula-land.test.ts tests/aula-panel.test.ts tests/aula-shell.test.ts`

## 2. Landmines (não repetir)

Estes falharam neste porte. Se o merge “parece simples”, leia de novo.

1. **Ciclo `aula.ts` ↔ `fill.ts`.** `fill.ts` importa `aulaSession`.
   `aula.ts` **não pode** importar `fill.ts`. Chaves proibidas no fill
   (`x`, `y`, `w`, `h`, `tier`) vivem em `fill-poison.ts`. Ambos importam
   o poison. `FILL_POISON` no session bloqueia o Build se o JSON do LLM
   trouxer geometria.
2. **`resolveOutput` não é pasta.** Serve para o `.pptx` de `study all`
   (`mkdirSync(dirname(abs))`). Diretório de `compile` / `ingest` usa
   `outputDirectory`.
3. **help-sync** quebra se o comando existe sem a cerca no README **e**
   a linha `genoffice study` no skill `genoffice` **e** bump de versão.
4. **`--focus` depois de 14/14 pede `--ship`.** Não é parte do porte.
5. **Não reanalisar `study-deck.zip` da `main`.** Contratos = **3.zip / v3**.
6. **Não portar `fit_pt` do python-pptx** enquanto o builder GenOffice
   cresce caixa. No modo study o grow está **desligado**; overflow é lint.
7. **Fase 3 não é outline de marketing.** Não toque `ai-provider`.
   Não alargue `LAYOUT_VARIANTS`.
8. **Tabelas** = grade de rects no page-spec, não table nativo.
9. **Imagem:** `https://` / `ai:` / `placeholder:` vira **painel rotulado**.
   O motor não baixa. `imgprep` só valida jpg/png local.
10. **Safe zone assimétrica 12.65** é canônica. Não “consertar”.
11. **Métrica Montserrat** no GenOffice ≠ `est_height` do python-pptx.
    Se COMPACT disparar no lugar errado, ajuste o estimador **deste**
    repo (`geometry.ts` / `fit-drift.ts`), não copie o renderer Python.

## 3. O que **não** copiar do 3.zip / slide-repo-v1

- writer `python-pptx`
- CLI `studydeck all`
- manifesto Python (`COURSE_INFO`, `exec`)
- qualquer coisa que coloque x no LLM

Do zip você só **consulta**: `when`, tetos, Layer B, `tier_for` STANDARD/COMPACT,
FIT 1.06, paleta UCP, golden inflamação.

## 4. Diff contra o fork novo — o que reancorar

O upstream vai ter mexido em arquivos que **nós também** tocamos.
Não copie no cego. Reancore:

| Arquivo no fork | O que colar de novo |
|---|---|
| `packages/pipelines/src/slides/index.ts` | exports nomeados do study (bloco no fim) |
| `packages/pipelines/src/slides/page-spec.ts` | skip de `growTextBoxesToContent` se `study_` |
| `packages/cli/src/cli.ts` | `register(studyCommand)` |
| `packages/cli/README.md` | cerca `genoffice study …` (help-sync) |
| `skills/genoffice/SKILL.md` | linha da tabela + **bump de versão** |
| `apps/slides/src/renderer/App.tsx` | Chat \| Aula, `onAulaBuild` → `landAulaPages` |

O diretório `study/` e o skill `genoffice-study/` em geral entram limpos
(upstream não os tem). Se o fork novo **já** tiver um `study`, diff
arquivo a arquivo e preserve **fill-poison** e o skip de grow.

## 5. Check verde no fork (definição de pronto)

Nesta ordem, no checkout do fork:

```bash
npm install --ignore-scripts   # vitest some se o snapshot dropou node_modules

npm run test -w @genoffice/pipelines -- tests/study-deck.test.ts tests/study-geometry.test.ts tests/study-style.test.ts tests/study-grow.test.ts
npm run test -w @genoffice/cli -- tests/study-check.test.ts tests/study-all.test.ts tests/study-skill.test.ts tests/study-fase4.test.ts

# smoke real
genoffice study check
# espera: 35/35 · contraste PASS

genoffice study all inflamacao.json --out aula.pptx
# 10 slides, título da inflamação no slide 1
```

Smoke do fill (sem LLM): `genoffice study fill outline.md` imprime o brief
BYOK e **recusa** JSON com `x`/`y`/`tier`.

Se `study check` não for 35/35, o porte **não** acabou. Não “compense”
com um deck de marketing.

## 6. Receita do autor (não muda no fork)

```bash
genoffice study ingest fonte.md --out work
genoffice study curve work/outline.md
genoffice study fill work/outline.md          # brief → LLM (skill genoffice-study)
genoffice study lint aula.json --json
genoffice study all aula.json --out aula.pptx
```

No editor: dock **Aula** → material → curva → brief → Build.

## 7. ADRs que o fork não pode relaxar

- **ADR-S1** — compiler; LLM não coloca x e não escolhe COMPACT.
- **ADR-S2** — manifesto JSON, não `exec` de Python.
- **ADR-S5** — outline study ≠ marketing.
- **ADR-S6** — não crescer text box em `study_*`.
- **ADR-S7** — uma medida, dois tiers. Sem 3º tier.
- **ADR-S8** — runtime = `genoffice study`; 3.zip = contratos; `python-pptx`
  não escreve.

## 8. Inventário rápido (rsync mental)

```
packages/pipelines/src/slides/study/          # motor
packages/pipelines/tests/study-*.test.ts
packages/pipelines/tests/fixtures/inflamacao.ts
packages/cli/src/commands/study.ts
packages/cli/tests/study*.test.ts
skills/genoffice-study/
docs/specs/study-deck-pipeline.md
docs/specs/study-port-fork.md                 # este arquivo
apps/slides/src/renderer/ai/AulaPanel.tsx
apps/slides/src/renderer/ai/StudyAulaShell.tsx
apps/slides/src/renderer/ai/aula-land.ts
apps/slides/tests/aula-*.test.ts
```

Mais os reanchors da §4.

## 9. Se o fork mudou o builder demais

1. Page-spec ainda é `{ layout, elements: [{ type, x, y, w, h, … }] }` em
   1280×720? Se sim, o compiler cola. Se o schema mudou, adapte **só**
   `painter.ts` / `compile.ts` — não os contratos.
2. `create --type pptx --spec` ainda existe? `study all` chama
   `buildDeckFromSpec`. Se o nome mudou, reancore **só** `study.ts` `all()`.
3. Font metrics / grow: o skip `study_` tem de sobreviver a qualquer
   refactor de grow. Procure `growTextBoxesToContent` no fork novo.

Não espere o `slide-repo-v1` implementar Fase 4. GenOffice **já é** o runtime.
