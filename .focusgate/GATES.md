# FocusGate Ledger: BYOK + study-deck pipeline
State: [shipped 4/4 BYOK] [study-deck spec in progress]

## 1. Domain Anchors (Micro-Glossary)
- **StudyDeck**: academic slide engine in rpsin9096/slide-repo-v1: 35 modules, UCP palette, WCAG AA hard gate.
- **page-spec**: GenOffice per-slide JSON (1280x720 freeform elements) for `create --type pptx --spec`.
- **module compiler**: StudyDeck module dict to page-spec; the LLM never places x/y.
- **BYOK**: user-owned AI backend (OpenCode Zen/Go or 9Router custom endpoint).
- **WCAG gate**: contrast check that refuses to write the pptx, same as studydeck contrast.

## 2. Acceptance Gates

### Production Gates
- [x] spec-exists: spec plan document is on disk and non-empty
  CHECK: test -s docs/specs/byok-opencode-9router.md && echo SPEC_EXISTS
  EXPECT: SPEC_EXISTS
  SCOPE: docs/specs/byok-opencode-9router.md, .focusgate/GATES.md

- [x] spec-current: spec names the three existing GenOffice AI paths
  CHECK: python3 -c "p='docs/specs/byok-opencode-9router.md'; t=open(p,encoding='utf-8').read(); req=('opencode-zen','opencode-go','custom','Genspark'); miss=[s for s in req if s not in t]; print('CURRENT_OK' if not miss else 'MISSING:'+','.join(miss))"
  EXPECT: CURRENT_OK
  SCOPE: docs/specs/byok-opencode-9router.md
  AFTER: spec-exists

- [x] spec-9router: spec pins 9Router default URL and OpenAI-compat contract
  CHECK: python3 -c "p='docs/specs/byok-opencode-9router.md'; t=open(p,encoding='utf-8').read(); ok=('localhost:20128' in t) and ('/v1' in t) and ('openai-compatible' in t.lower() or 'OpenAI-compatible' in t or 'OpenAI-compatível' in t); print('NINEROUTER_OK' if ok else 'NINEROUTER_MISSING')"
  EXPECT: NINEROUTER_OK
  SCOPE: docs/specs/byok-opencode-9router.md
  AFTER: spec-exists

- [x] spec-phases: spec has a zero-code path and a fork-change path
  CHECK: python3 -c "p='docs/specs/byok-opencode-9router.md'; t=open(p,encoding='utf-8').read(); ok=('Fase 0' in t or 'Phase 0' in t) and ('Fase 1' in t or 'Phase 1' in t) and ('activeProvider' in t); print('PHASES_OK' if ok else 'PHASES_MISSING')"
  EXPECT: PHASES_OK
  SCOPE: docs/specs/byok-opencode-9router.md
  AFTER: spec-exists

- [x] study-spec-exists: study-deck pipeline spec is on disk
  CHECK: test -s docs/specs/study-deck-pipeline.md && echo STUDY_SPEC_EXISTS
  EXPECT: STUDY_SPEC_EXISTS
  SCOPE: docs/specs/study-deck-pipeline.md, .focusgate/GATES.md

- [x] study-gap: spec names the quality gap (modules vs freeform layout)
  CHECK: python3 -c "p='docs/specs/study-deck-pipeline.md'; t=open(p,encoding='utf-8').read(); need=('35','module','page-spec','WCAG','compiler'); miss=[s for s in need if s not in t]; print('GAP_OK' if not miss else 'GAP_MISSING:'+','.join(miss))"
  EXPECT: GAP_OK
  SCOPE: docs/specs/study-deck-pipeline.md
  AFTER: study-spec-exists

- [x] study-compile: spec forbids LLM layout and pins a compiler
  CHECK: python3 -c "p='docs/specs/study-deck-pipeline.md'; t=open(p,encoding='utf-8').read(); ok=('compiler' in t) and ('nao coloca x' in t.lower() or 'não coloca x' in t or 'never places' in t.lower()) and ('Fase 0' in t); print('COMPILE_OK' if ok else 'COMPILE_MISSING')"
  EXPECT: COMPILE_OK
  SCOPE: docs/specs/study-deck-pipeline.md
  AFTER: study-spec-exists

- [x] study-v3: spec is pinned to study-deck 3.zip (v3 density + Layer B)
  CHECK: python3 -c "p='docs/specs/study-deck-pipeline.md'; t=open(p,encoding='utf-8').read(); need=('study-deck 3.zip','COMPACT','Layer B','tier_for','style.py'); miss=[s for s in need if s not in t]; print('V3_OK' if not miss else 'V3_MISSING:'+','.join(miss))"
  EXPECT: V3_OK
  SCOPE: docs/specs/study-deck-pipeline.md
  AFTER: study-spec-exists

- [x] study-geo-tier: tier_for matches 3.zip STANDARD/COMPACT fixtures
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-geometry.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/geometry.ts, packages/pipelines/tests/study-geometry.test.ts

- [x] study-compile-definition: compileDefinition emits study_definition page-spec with a named tier
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-compile.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/**, packages/pipelines/tests/study-compile.test.ts, packages/pipelines/src/slides/index.ts
  AFTER: study-geo-tier

- [x] study-style-lint: Layer B style_hits matches 3.zip (crutch/metaphor/vague/literal)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-style.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/style.ts, packages/pipelines/tests/study-style.test.ts
  AFTER: study-compile-definition

- [x] study-inflamacao-deck: compileDeck emits 10 study_* pages for the inflamacao fixture
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-deck.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/**, packages/pipelines/tests/study-deck.test.ts, packages/pipelines/src/slides/index.ts
  AFTER: study-style-lint

- [x] study-cli-lint: genoffice study lint reports PASS or STYLE_CRUTCH
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/cli/src/commands/study.ts, packages/cli/src/cli.ts, packages/cli/tests/study.test.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/src/slides/index.ts, packages/cli/README.md, skills/genoffice/SKILL.md
  AFTER: study-inflamacao-deck

- [x] study-cli-compile: genoffice study compile writes NN.json page specs
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/cli/src/commands/study.ts, packages/cli/src/cli.ts, packages/cli/tests/study.test.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/src/slides/index.ts
  AFTER: study-cli-lint

- [x] study-contract-lint: lintDeck enforces REQUIRED, B caps and list cardinality (3.zip)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-contract.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/lint.ts, packages/pipelines/tests/study-contract.test.ts
  AFTER: study-cli-compile

- [x] study-i18n-drift: lintDeck blocks wrong-language calques (3.zip drift_hits)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-i18n.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/i18n.ts, packages/pipelines/src/slides/study/lint.ts, packages/pipelines/tests/study-i18n.test.ts
  AFTER: study-contract-lint

- [x] study-fit-lint: lintDeck reports estimated overflow at FIT_TOLERANCE 1.06
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-fit.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/lint.ts, packages/pipelines/tests/study-fit.test.ts
  AFTER: study-i18n-drift

- [x] study-cli-all: genoffice study all lints once, compiles and writes a pptx
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-all.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/cli/src/commands/study.ts, packages/cli/tests/study-all.test.ts, packages/cli/README.md, skills/genoffice/SKILL.md
  AFTER: study-fit-lint

- [x] study-no-grow: study_* page-specs keep the compiler box; overflow is not stretched
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-grow.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/page-spec.ts, packages/pipelines/tests/study-grow.test.ts
  AFTER: study-cli-all

- [x] study-figure-module: compileSlide figure emits study_figure with a labeled panel (no download)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-figure.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/types.ts, packages/pipelines/src/slides/study/modules.ts, packages/pipelines/src/slides/study/painter.ts, packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/src/slides/study/i18n.ts, packages/pipelines/src/slides/study/images.ts, packages/pipelines/tests/study-figure.test.ts
  AFTER: study-no-grow

- [x] study-stat-card: compileSlide stat_card emits study_stat_card with the hero metric
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-stat-card.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/types.ts, packages/pipelines/src/slides/study/modules.ts, packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/tests/study-stat-card.test.ts
  AFTER: study-figure-module

- [x] study-checklist: compileSlide checklist emits study_checklist with ✓/✕ items
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-checklist.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/types.ts, packages/pipelines/src/slides/study/modules.ts, packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/tests/study-checklist.test.ts
  AFTER: study-stat-card

- [x] study-classic-batch: remaining classic modules compile (algorithm, schema, side_by_side, taxonomy, synthesis_grid)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-classic.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/types.ts, packages/pipelines/src/slides/study/modules.ts, packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/src/slides/study/geometry.ts, packages/pipelines/tests/study-classic.test.ts
  AFTER: study-checklist

- [x] study-diagram-batch: diagram family compiles (cycle, quadrant, pyramid, venn, concept_map, chart_data)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-diagram.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/types.ts, packages/pipelines/src/slides/study/modules.ts, packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/src/slides/study/i18n.ts, packages/pipelines/tests/study-diagram.test.ts
  AFTER: study-classic-batch

- [x] study-scholarly-batch: scholarly/pedagogy leftovers compile (quote, socratic, oxford, evidence, viva, mnemonic, etymology, references, authority, colloquy, annotated)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-scholarly.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/types.ts, packages/pipelines/src/slides/study/modules.ts, packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/manifest.ts, packages/pipelines/src/slides/study/i18n.ts, packages/pipelines/src/slides/study/geometry.ts, packages/pipelines/tests/study-scholarly.test.ts
  AFTER: study-diagram-batch

- [x] study-wcag-write: ContrastGate refuses write when a text/surface pair is below WCAG AA
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-wcag.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/contrast.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/pipelines/tests/study-wcag.test.ts, packages/cli/tests/study-all.test.ts
  AFTER: study-scholarly-batch

- [x] study-skill-prompt: 3.zip SYSTEM_PROMPT lives in skills/genoffice-study (Layer A/B, 15-40 causal cycle, genoffice study CLI)
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-skill.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: skills/genoffice-study/SKILL.md, packages/cli/tests/study-skill.test.ts
  AFTER: study-wcag-write

- [x] study-when-catalog: every module has a 3.zip `when` (context-aware choice, not a recipe)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-when.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/when.ts, packages/pipelines/src/slides/index.ts, packages/pipelines/tests/study-when.test.ts
  AFTER: study-skill-prompt

- [x] study-schema-cli: `genoffice study schema` lists 35 `when` lines; `schema <module>` prints contract + JSON skeleton
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-schema.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/schema.ts, packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/cli/tests/study-schema.test.ts
  AFTER: study-when-catalog

- [x] study-visual-16x9: compiled study pages stay on 1280x720 and above TYPE_FLOOR_PT; study all refuses overflow
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-visual.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/visual.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/pipelines/tests/study-visual.test.ts, packages/cli/tests/study-all.test.ts
  AFTER: study-schema-cli

- [x] study-ingest: source md/txt → outline.md (numbered headings vs body); CLI `study ingest`
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-ingest.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/ingest.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/pipelines/tests/study-ingest.test.ts, packages/cli/tests/study-ingest.test.ts
  AFTER: study-visual-16x9

- [x] study-fit-drift: FIT_RULES box is the box the compiler paints (3.zip test_fit_drift)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-fit-drift.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/contracts.ts, packages/pipelines/src/slides/study/fit-drift.ts, packages/pipelines/src/slides/index.ts, packages/pipelines/tests/study-fit-drift.test.ts
  AFTER: study-ingest

- [x] study-ucp-tokens: compiled paint is UCP + derived WCAG tokens; no loose hex in the compiler
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-tokens.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/palette-ucp.ts, packages/pipelines/src/slides/index.ts, packages/pipelines/tests/study-tokens.test.ts
  AFTER: study-fit-drift

- [x] study-schema-tokens: `genoffice study schema tokens` prints the UCP WCAG text-token table
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-schema-tokens.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/palette-ucp.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/cli/tests/study-schema-tokens.test.ts
  AFTER: study-ucp-tokens

- [x] study-check: `genoffice study check` self-tests 35/35 modules + fixture contrast
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-check.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/fixtures.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/cli/tests/study-check.test.ts
  AFTER: study-schema-tokens

- [x] study-contrast: `genoffice study contrast` scans fixture UCP matrix or a manifest
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-contrast.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/cli/tests/study-contrast.test.ts
  AFTER: study-check

- [x] study-imgprep: `genoffice study imgprep [dir]` enforces jpg/png 20 KB–4 MB and min side 300 px
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-imgprep.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/imgprep.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/pipelines/tests/study-imgprep.test.ts, packages/cli/tests/study-imgprep.test.ts
  AFTER: study-contrast

- [x] study-new: `genoffice study new [short|lecture|custom]` writes a JSON scaffold that lints
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-new.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/scaffold.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/cli/tests/study-new.test.ts
  AFTER: study-imgprep

- [x] study-ingest-pdf: `genoffice study ingest` accepts a PDF source (3.zip pdf|txt|md)
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-ingest-pdf.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/cli/tests/study-ingest-pdf.test.ts
  AFTER: study-new

- [x] study-curve: outline.md → pedagogical curve (sections + when); refuse marketing layouts
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-curve.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/curve.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/pipelines/tests/study-curve.test.ts, packages/cli/tests/study-curve.test.ts
  AFTER: study-ingest-pdf

- [x] study-layer-b-visible: lint errors are rows the Aula panel can render (STYLE_* / fit / drift)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-layer-b.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/layer-b.ts, packages/pipelines/src/slides/index.ts, packages/cli/src/commands/study.ts, packages/pipelines/tests/study-layer-b.test.ts, packages/cli/tests/study-layer-b.test.ts
  AFTER: study-curve

- [x] study-aula-panel: Slides Aula panel shows material → curve → Layer B → build (build blocked on lint)
  CHECK: npm run test -w @genoffice/slides -- --no-color tests/aula-panel.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: apps/slides/src/renderer/ai/AulaPanel.tsx, apps/slides/tests/aula-panel.test.ts
  AFTER: study-layer-b-visible

- [x] study-aula-shell: Slides AI dock can switch Chat | Aula; Aula keeps AiPanel mounted
  CHECK: npm run test -w @genoffice/slides -- --no-color tests/aula-shell.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: apps/slides/src/renderer/ai/StudyAulaShell.tsx, apps/slides/src/renderer/App.tsx, apps/slides/tests/aula-shell.test.ts
  AFTER: study-aula-panel

- [x] study-aula-session: source → curve → Layer B; build only if lint is clean (Aula panel live)
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-aula-session.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/aula.ts, packages/pipelines/src/slides/index.ts, apps/slides/src/renderer/ai/AulaPanel.tsx, apps/slides/src/renderer/ai/StudyAulaShell.tsx, apps/slides/src/renderer/App.tsx, packages/pipelines/tests/study-aula-session.test.ts, apps/slides/tests/aula-session.test.ts
  AFTER: study-aula-shell

- [x] study-aula-build: Aula Build compiles page-specs when lint is clean; refuses Layer B / marketing
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-aula-build.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/aula.ts, packages/pipelines/src/slides/index.ts, apps/slides/src/renderer/ai/StudyAulaShell.tsx, packages/pipelines/tests/study-aula-build.test.ts, apps/slides/tests/aula-build.test.ts
  AFTER: study-aula-session

- [x] study-aula-land: Aula Build lands page-specs on the canvas (localGeneratePage + replace)
  CHECK: npm run test -w @genoffice/slides -- --no-color tests/aula-land.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: apps/slides/src/renderer/ai/aula-land.ts, apps/slides/src/renderer/App.tsx, apps/slides/tests/aula-land.test.ts
  AFTER: study-aula-build

- [x] study-aula-fill: BYOK fill brief from the curve; refuse x/y/tier/hex/marketing in the returned JSON
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-aula-fill.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/fill.ts, packages/pipelines/src/slides/index.ts, apps/slides/src/renderer/ai/AulaPanel.tsx, apps/slides/src/renderer/ai/StudyAulaShell.tsx, packages/pipelines/tests/study-aula-fill.test.ts, apps/slides/tests/aula-fill.test.ts
  AFTER: study-aula-land

- [x] study-fill-guard: session + CLI `study fill` refuse x/y/tier; print the BYOK brief from outline.md
  CHECK: npm run test -w @genoffice/pipelines -- --no-color tests/study-fill-guard.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: packages/pipelines/src/slides/study/aula.ts, packages/pipelines/src/slides/study/fill-poison.ts, packages/pipelines/src/slides/study/fill.ts, packages/cli/src/commands/study.ts, packages/cli/README.md, skills/genoffice/SKILL.md, packages/pipelines/tests/study-fill-guard.test.ts, packages/cli/tests/study-fill.test.ts
  AFTER: study-aula-fill

- [x] study-fase4-runtime: GenOffice is the study runtime; python-pptx is not the writer (OpenCode: lint → compile → all)
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-fase4.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: skills/genoffice-study/SKILL.md, docs/specs/study-deck-pipeline.md, packages/cli/tests/study-fase4.test.ts
  AFTER: study-fill-guard

- [x] study-port-fork: spec for porting study-deck onto a future GenOffice fork
  CHECK: npm run test -w @genoffice/cli -- --no-color tests/study-port.test.ts
  EXPECT: Test Files  1 passed
  SCOPE: docs/specs/study-port-fork.md, packages/cli/tests/study-port.test.ts
  AFTER: study-fase4-runtime

## 3. Micro-ADR Ledger
- **ADR-1 (BYOK)**: 9Router stays Custom; do not duplicate as an internal gateway.
- **ADR-study**: keep StudyDeck contracts; replace only the python-pptx renderer with GenOffice page-spec.
- **ADR-S8 (Fase 4)**: in this repo the study runtime is `genoffice study`; 3.zip is contracts-only. python-pptx does not write the aula.
