# Delivery: FocusGate Ledger: BYOK + study-deck pipeline

- Shipped: 2026-10-13T01:51:04Z
- Git head: 418477e
- Gates: 50 settled of 50 (50 verified by a CHECK, 0 attested)
- Re-run at ship time: all passing
- Evidence: 99 records, chain verified, anchored at head a14fb17c1c5ecacd

## Gates
| Gate | Title | Evidence | Notes |
|---|---|---|---|
| spec-exists | spec plan document is on disk and non-empty | red, then green |  |
| spec-current | spec names the three existing GenOffice AI paths | red, then green |  |
| spec-9router | spec pins 9Router default URL and OpenAI-compat contract | red, then green |  |
| spec-phases | spec has a zero-code path and a fork-change path | red, then green |  |
| study-spec-exists | study-deck pipeline spec is on disk | red, then green |  |
| study-gap | spec names the quality gap (modules vs freeform layout) | red, then green |  |
| study-compile | spec forbids LLM layout and pins a compiler | red, then green |  |
| study-v3 | spec is pinned to study-deck 3.zip (v3 density + Layer B) | red, then green |  |
| study-geo-tier | tier_for matches 3.zip STANDARD/COMPACT fixtures | green only (never seen failing) | WAIVED (see Overrides) |
| study-compile-definition | compileDefinition emits study_definition page-spec with a named tier | green only (never seen failing) | WAIVED (see Overrides) |
| study-style-lint | Layer B style_hits matches 3.zip (crutch/metaphor/vague/literal) | green only (never seen failing) | WAIVED (see Overrides) |
| study-inflamacao-deck | compileDeck emits 10 study_* pages for the inflamacao fixture | green only (never seen failing) | WAIVED (see Overrides) |
| study-cli-lint | genoffice study lint reports PASS or STYLE_CRUTCH | red, then green |  |
| study-cli-compile | genoffice study compile writes NN.json page specs | red, then green |  |
| study-contract-lint | lintDeck enforces REQUIRED, B caps and list cardinality (3.zip) | red, then green |  |
| study-i18n-drift | lintDeck blocks wrong-language calques (3.zip drift_hits) | red, then green |  |
| study-fit-lint | lintDeck reports estimated overflow at FIT_TOLERANCE 1.06 | red, then green |  |
| study-cli-all | genoffice study all lints once, compiles and writes a pptx | red, then green |  |
| study-no-grow | study_* page-specs keep the compiler box; overflow is not stretched | red, then green |  |
| study-figure-module | compileSlide figure emits study_figure with a labeled panel (no downl… | red, then green |  |
| study-stat-card | compileSlide stat_card emits study_stat_card with the hero metric | red, then green |  |
| study-checklist | compileSlide checklist emits study_checklist with ✓/✕ items | red, then green |  |
| study-classic-batch | remaining classic modules compile (algorithm, schema, side_by_side, t… | red, then green |  |
| study-diagram-batch | diagram family compiles (cycle, quadrant, pyramid, venn, concept_map,… | red, then green |  |
| study-scholarly-batch | scholarly/pedagogy leftovers compile (quote, socratic, oxford, eviden… | red, then green |  |
| study-wcag-write | ContrastGate refuses write when a text/surface pair is below WCAG AA | red, then green |  |
| study-skill-prompt | 3.zip SYSTEM_PROMPT lives in skills/genoffice-study (Layer A/B, 15-40… | red, then green |  |
| study-when-catalog | every module has a 3.zip `when` (context-aware choice, not a recipe) | red, then green |  |
| study-schema-cli | `genoffice study schema` lists 35 `when` lines; `schema <module>` pri… | red, then green |  |
| study-visual-16x9 | compiled study pages stay on 1280x720 and above TYPE_FLOOR_PT; study … | red, then green |  |
| study-ingest | source md/txt → outline.md (numbered headings vs body); CLI `study in… | red, then green |  |
| study-fit-drift | FIT_RULES box is the box the compiler paints (3.zip test_fit_drift) | red, then green |  |
| study-ucp-tokens | compiled paint is UCP + derived WCAG tokens; no loose hex in the comp… | red, then green |  |
| study-schema-tokens | `genoffice study schema tokens` prints the UCP WCAG text-token table | red, then green |  |
| study-check | `genoffice study check` self-tests 35/35 modules + fixture contrast | red, then green |  |
| study-contrast | `genoffice study contrast` scans fixture UCP matrix or a manifest | red, then green |  |
| study-imgprep | `genoffice study imgprep [dir]` enforces jpg/png 20 KB–4 MB and min s… | red, then green |  |
| study-new | `genoffice study new [short/lecture/custom]` writes a JSON scaffold t… | red, then green |  |
| study-ingest-pdf | `genoffice study ingest` accepts a PDF source (3.zip pdf/txt/md) | red, then green |  |
| study-curve | outline.md → pedagogical curve (sections + when); refuse marketing la… | red, then green |  |
| study-layer-b-visible | lint errors are rows the Aula panel can render (STYLE_* / fit / drift) | red, then green |  |
| study-aula-panel | Slides Aula panel shows material → curve → Layer B → build (build blo… | red, then green |  |
| study-aula-shell | Slides AI dock can switch Chat / Aula; Aula keeps AiPanel mounted | red, then green |  |
| study-aula-session | source → curve → Layer B; build only if lint is clean (Aula panel liv… | red, then green |  |
| study-aula-build | Aula Build compiles page-specs when lint is clean; refuses Layer B / … | red, then green |  |
| study-aula-land | Aula Build lands page-specs on the canvas (localGeneratePage + replac… | red, then green |  |
| study-aula-fill | BYOK fill brief from the curve; refuse x/y/tier/hex/marketing in the … | red, then green |  |
| study-fill-guard | session + CLI `study fill` refuse x/y/tier; print the BYOK brief from… | red, then green |  |
| study-fase4-runtime | GenOffice is the study runtime; python-pptx is not the writer (OpenCo… | red, then green |  |
| study-port-fork | spec for porting study-deck onto a future GenOffice fork | red, then green |  |

## Overrides
- study-geo-tier: red-before-green waived: "TDD red observed: vitest failed with Cannot find module before geometry.ts existed; CHECK could not be baselined until npm install --ignore-scripts"
- study-compile-definition: red-before-green waived: "TDD red observed: same vitest Cannot find module run before compile.ts existed; CHECK fingerprint recorded after npm install"
- study-style-lint: red-before-green waived: "TDD red: vitest Cannot find module style.ts before implementation"
- study-inflamacao-deck: red-before-green waived: "TDD red: vitest Cannot find module compileDeck/lintDeck before implementation"

## Residual risk
- The CHECK analyzer is heuristic: it cannot tell whether a real test asserts anything. Red-before-green narrows that gap and does not close it.
- 4 gate(s) were never seen failing with their final CHECK, so passing does not show the change made the difference.
- The evidence log is tamper-evident, not tamper-proof. Commit GATES.evidence.anchor.txt (or print it in CI) so a rewrite is detectable.
