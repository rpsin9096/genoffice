import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import {
  compileDeck,
  deckContrastFailures,
  deckVisualFailures,
  describeStudyModule,
  fillBrief,
  failureLines,
  lintDeck,
  ingestOutline,
  layerBVisible,
  listStudyModules,
  marketingHits,
  parseStudyCurve,
  parseStudyManifest,
  prepareImages,
  scaffoldManifest,
  selfTest,
  isStudyGuide,
  GUIDES,
  UCP_TOKENS,
} from '@genoffice/pipelines/slides'
import { flagString } from '../args'
import { resolveInput, resolveOutput, writeOutput } from '../fs'
import { pdfText } from '../formats/pdf'
import { outputDirectory } from '../formats/render'
import { buildDeckFromSpec } from '../formats/slide-spec'
import type { CommandContext, CommandDef } from '../registry'
import { CliError, EXIT, type CommandResult } from '../result'

export const studyCommand: CommandDef = {
  name: 'study',
  summary:
    'Lint a study-deck JSON manifest, compile it to NN.json page specs, write a .pptx, print module `when`, ingest a source, self-test 35/35, scan UCP contrast, check local images, write a JSON scaffold, print the pedagogical curve, or print the BYOK fill brief.',
  usage:
    'study lint <manifest.json> | study compile <manifest.json> --out <dir> | study all <manifest.json> --out <file.pptx> | study schema [module] | study ingest <source.md|txt|pdf> --out <dir> | study check | study contrast [manifest.json] | study imgprep [dir] | study new [short|lecture|custom] | study curve <outline.md> | study fill [outline.md]',
  options: [
    {
      name: 'out',
      value: 'path',
      description:
        'compile: directory for 01.json, 02.json, …; all: the .pptx to write; ingest: directory for outline.md',
    },
  ],
  async run(args, ctx) {
    const [verb, file] = args.positionals
    switch (verb) {
      case 'lint':
        return lint(file, ctx)
      case 'compile':
        return compile(file, args, ctx)
      case 'all':
        return all(file, args, ctx)
      case 'schema':
        return schema(file)
      case 'ingest':
        return ingest(file, args, ctx)
      case 'check':
        return check()
      case 'contrast':
        return contrast(file, ctx)
      case 'imgprep':
        return imgprep(file, ctx)
      case 'new':
        return createNew(file, args, ctx)
      case 'curve':
        return curve(file, ctx)
      case 'fill':
        return fill(file, ctx)
      default:
        throw new CliError(
          EXIT.usage,
          'expected "study lint <manifest.json>", "study compile <manifest.json> --out <dir>", "study all <manifest.json> --out <file.pptx>", "study schema [module]", "study ingest <source.md|txt|pdf> --out <dir>", "study check", "study contrast [manifest.json]", "study imgprep [dir]", "study new [short|lecture|custom]", "study curve <outline.md>", or "study fill [outline.md]"',
          undefined,
          {
            reason: verb === undefined ? 'missing_argument' : 'invalid_argument',
            suggestion: 'run `genoffice help study`',
          },
        )
    }
  },
}

function loadManifest(file: string | undefined, ctx: CommandContext) {
  const path = resolveInput(file, ctx)
  const parsed = parseStudyManifest(readFileSync(path, 'utf-8'))
  if (!parsed.ok) {
    throw new CliError(EXIT.usage, parsed.error, undefined, {
      reason: parsed.reason,
      suggestion: 'pass a study-deck JSON manifest with course and slides[]',
    })
  }
  return parsed.manifest
}








function fill(file: string | undefined, ctx: CommandContext): CommandResult {
  const raw = file ? readFileSync(resolveInput(file, ctx), 'utf-8') : ''
  if (file && file.toLowerCase().endsWith('.json')) {
    const hits = marketingHits(JSON.parse(raw))
    if (hits.length) {
      throw new CliError(
        EXIT.usage,
        'outline de marketing recusado (use modulos study, nao cover|content|data)',
        { errors: hits },
        { reason: 'invalid_argument', suggestion: 'run `genoffice study ingest` then match `when`' },
      )
    }
  }
  const curveDoc = parseStudyCurve(raw)
  const brief = fillBrief({
    sourceLabel: file ? basename(resolveInput(file, ctx)) : 'fonte',
    outline: raw,
    curve: curveDoc,
    layerB: [],
    canBuild: false,
  })
  return {
    summary: 'BYOK fill brief — o motor NAO coloca x',
    detail: { brief, sections: curveDoc.sections.length },
  }
}

function curve(file: string | undefined, ctx: CommandContext): CommandResult {
  const src = resolveInput(file, ctx)
  const raw = readFileSync(src, 'utf-8')
  if (src.toLowerCase().endsWith('.json')) {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new CliError(EXIT.usage, 'curve JSON invalido', undefined, {
        reason: 'invalid_json',
        suggestion: 'pass outline.md from `study ingest`',
      })
    }
    const hits = marketingHits(parsed)
    if (hits.length) {
      throw new CliError(
        EXIT.usage,
        'outline de marketing recusado (use modulos study, nao cover|content|data)',
        { errors: hits },
        { reason: 'invalid_argument', suggestion: 'run `genoffice study ingest` then match `when`' },
      )
    }
  }
  const curveDoc = parseStudyCurve(raw)
  return {
    summary: `${curveDoc.sections.length} secao(oes) — case cada uma com um when`,
    detail: curveDoc,
  }
}

function createNew(
  profile: string | undefined,
  args: Parameters<CommandDef['run']>[0],
  ctx: CommandContext,
): CommandResult {
  const name = profile ?? 'short'
  if (!isStudyGuide(name)) {
    throw new CliError(
      EXIT.usage,
      `guia desconhecida: ${name}; use ${Object.keys(GUIDES).join(', ')}`,
      { profile: name },
      { reason: 'invalid_argument', suggestion: 'run `genoffice study new short|lecture|custom`' },
    )
  }
  const out = resolve(ctx.cwd, flagString(args, 'out') ?? 'manifest.json')
  if (existsSync(out)) {
    throw new CliError(EXIT.usage, `${out} ja existe (nao sobrescreve)`, { path: out }, {
      reason: 'output_exists',
      suggestion: 'pass a new --out path',
    })
  }
  const manifest = scaffoldManifest(name)
  writeOutput(out, JSON.stringify(manifest, null, 2) + '\n')
  const guide = GUIDES[name]
  return {
    summary: `Scaffold escrito: ${out} (guia "${name}": ${guide.length})`,
    outputPath: out,
    detail: { profile: name, slides: manifest.slides.length, length: guide.length, hint: guide.hint },
  }
}

function imgprep(file: string | undefined, ctx: CommandContext): CommandResult {
  const target = resolve(ctx.cwd, file ?? 'work/imgs')
  const r = prepareImages(target)
  const detail = {
    target: r.target,
    contract: r.contract,
    missingDir: r.missingDir,
    failures: r.failures,
    files: r.files,
  }
  if (r.missingDir) {
    return {
      summary: `INFO ${r.target} ainda nao existe: crie a pasta e deposite as figuras.`,
      detail,
    }
  }
  if (!r.ok) {
    throw new CliError(
      EXIT.usage,
      `imgprep FAIL — ${r.failures} imagen(es) fora do contrato`,
      detail,
      { reason: 'invalid_argument', suggestion: 'use jpg/png, 20 KB-4 MB, lado menor >= 300 px' },
    )
  }
  return {
    summary: r.files.length ? `PASS — ${r.files.length} imagen(es)` : `INFO sem imagens em ${r.target}`,
    detail,
  }
}

function contrast(file: string | undefined, ctx: CommandContext): CommandResult {
  if (!file) {
    const { rows, fails } = selfTest()
    if (fails.length) {
      throw new CliError(
        EXIT.usage,
        `contrast FAIL — ${fails.length} par(es) abaixo do limiar`,
        { mode: 'fixture', theme: 'ucp', contrast: fails.length, slides: rows.length, errors: fails },
        { reason: 'invalid_argument', suggestion: 'fix UCP contrast pairs then re-run' },
      )
    }
    return {
      summary: `PASS — 0 violaciones (${rows.length} slides).`,
      detail: { mode: 'fixture', theme: 'ucp', contrast: 0, slides: rows.length, errors: [] },
    }
  }
  const manifest = loadManifest(file, ctx)
  const compiled = compileDeck(manifest)
  const fails = deckContrastFailures(compiled)
  if (fails.length) {
    throw new CliError(
      EXIT.usage,
      `contrast FAIL — ${fails.length} par(es) abaixo do limiar`,
      {
        mode: 'manifest',
        contrast: fails.length,
        slides: compiled.length,
        errors: failureLines(fails, fails.length),
      },
      { reason: 'invalid_argument', suggestion: 'fix text/surface pairs then re-run' },
    )
  }
  return {
    summary: `PASS — 0 violaciones (${compiled.length} slides).`,
    detail: { mode: 'manifest', contrast: 0, slides: compiled.length, errors: [] },
  }
}

function check(): CommandResult {
  const { rows, fails } = selfTest()
  const ok = rows.filter((r) => r.ok).length
  if (ok !== rows.length || fails.length) {
    throw new CliError(
      EXIT.usage,
      `check FAIL — ${ok}/${rows.length} módulos, ${fails.length} contraste`,
      { rows, contrast: fails.length, errors: fails },
      { reason: 'invalid_argument', suggestion: 'fix UCP contrast pairs then re-run' },
    )
  }
  return {
    summary: `modulos ${ok}/${rows.length} · contraste PASS — 0 violaciones`,
    detail: { modules: rows.length, ok, contrast: fails.length, rows },
  }
}

async function ingest(
  file: string | undefined,
  args: Parameters<CommandDef['run']>[0],
  ctx: CommandContext,
): Promise<CommandResult> {
  const src = resolveInput(file, ctx)
  const ext = src.toLowerCase().split('.').pop() ?? ''
  if (ext !== 'md' && ext !== 'txt' && ext !== 'markdown' && ext !== 'pdf') {
    throw new CliError(EXIT.usage, `formato .${ext || '?'} nao suportado (md/txt/pdf)`, { ext }, {
      reason: 'unsupported',
      suggestion: 'pass a .md, .txt or .pdf source',
    })
  }
  const text =
    ext === 'pdf'
      ? (
          await pdfText(readFileSync(src), {
            maxChars: Number.MAX_SAFE_INTEGER,
            select: (n) => [1, n],
          })
        ).pages_read
          .map((p) => p.text)
          .join('\n')
      : readFileSync(src, 'utf-8')
  const { markdown, blocks } = ingestOutline(text, basename(src))
  const outDir = outputDirectory(flagString(args, 'out'), ctx)
  mkdirSync(outDir, { recursive: true })
  const outline = join(outDir, 'outline.md')
  writeOutput(outline, markdown)
  return {
    summary: `outline em ${outline} (${blocks} blocos de texto)`,
    outputPath: outline,
    detail: { outline, blocks },
  }
}

function schema(name: string | undefined): CommandResult {
  if (!name) {
    const modules = listStudyModules()
    return {
      summary: `${modules.length} modules — escolha pelo when. Por modulo: schema <modulo> · Tokens WCAG: schema tokens`,
      detail: { modules },
    }
  }
  if (name === 'tokens') {
    return {
      summary: 'Tokens WCAG: schema tokens',
      detail: { theme: 'ucp', tokens: { ucp: { ...UCP_TOKENS } } },
    }
  }
  const spec = describeStudyModule(name)
  if (!spec) {
    throw new CliError(EXIT.usage, `modulo desconhecido: ${name}`, { module: name }, {
      reason: 'invalid_argument',
      suggestion: 'run `genoffice study schema`',
    })
  }
  return {
    summary: `QUANDO USAR: ${spec.when}`,
    detail: spec,
  }
}

function lintErrors(manifest: ReturnType<typeof loadManifest>): string[] {
  return lintDeck(manifest.slides, manifest.config?.lang ?? 'pt-BR')
}

function refuseLint(errors: string[]): never {
  throw new CliError(
    EXIT.usage,
    `${errors.length} style error${errors.length === 1 ? '' : 's'}`,
    { errors, layerB: layerBVisible(errors) },
    {
      reason: 'invalid_argument',
      suggestion: 'fix Layer B style hits then re-run',
    },
  )
}

function lint(file: string | undefined, ctx: CommandContext): CommandResult {
  const manifest = loadManifest(file, ctx)
  const errors = lintErrors(manifest)
  if (errors.length) refuseLint(errors)
  return {
    summary: `PASS — ${manifest.slides.length} slide${manifest.slides.length === 1 ? '' : 's'}`,
    detail: { slides: manifest.slides.length, errors: [], layerB: [] },
  }
}

function compile(
  file: string | undefined,
  args: Parameters<CommandDef['run']>[0],
  ctx: CommandContext,
): CommandResult {
  const manifest = loadManifest(file, ctx)
  const errors = lintErrors(manifest)
  if (errors.length) refuseLint(errors)
  const outDir = outputDirectory(flagString(args, 'out'), ctx)
  mkdirSync(outDir, { recursive: true })
  const compiled = compileDeck(manifest)
  const files: string[] = []
  const pages: Array<{ file: string; layout: string; tier: string }> = []
  compiled.forEach((r, i) => {
    const name = `${String(i + 1).padStart(2, '0')}.json`
    writeOutput(join(outDir, name), JSON.stringify(r.page, null, 2) + '\n')
    files.push(name)
    pages.push({ file: name, layout: r.page.layout, tier: r.tier.name })
  })
  return {
    summary: `compiled ${files.length} page spec${files.length === 1 ? '' : 's'} to ${outDir}`,
    outputPath: outDir,
    detail: { files, pages, slides: files.length },
  }
}

async function all(
  file: string | undefined,
  args: Parameters<CommandDef['run']>[0],
  ctx: CommandContext,
): Promise<CommandResult> {
  const manifest = loadManifest(file, ctx)
  const errors = lintErrors(manifest)
  if (errors.length) refuseLint(errors)
  const compiled = compileDeck(manifest)
  const contrast = deckContrastFailures(compiled)
  if (contrast.length) {
    throw new CliError(
      EXIT.usage,
      `${contrast.length} contrast error${contrast.length === 1 ? '' : 's'}`,
      { errors: failureLines(contrast, contrast.length) },
      {
        reason: 'invalid_argument',
        suggestion: 'fix text/surface pairs then re-run',
      },
    )
  }
  const visual = deckVisualFailures(compiled)
  if (visual.length) {
    throw new CliError(
      EXIT.usage,
      `${visual.length} visual error${visual.length === 1 ? '' : 's'}`,
      { errors: visual },
      {
        reason: 'invalid_argument',
        suggestion: 'keep elements on 1280x720 and type at or above 9 pt',
      },
    )
  }
  const built = await buildDeckFromSpec(
    JSON.stringify({ pages: compiled.map((r) => r.page) }),
    'study all',
    ctx,
  )
  const output = resolveOutput(flagString(args, 'out'), ctx, { fresh: true })
  writeOutput(output, built.bytes)
  return {
    summary: `wrote ${compiled.length} slide${compiled.length === 1 ? '' : 's'} to ${basename(output)}`,
    outputPath: output,
    detail: {
      slides: compiled.length,
      issues: built.issues,
      imageFailures: built.imageFailures,
      contrast: [],
      visual: [],
    },
  }
}
