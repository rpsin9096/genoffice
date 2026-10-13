/**
 * Parallel StudyDeck v3 AI generation, progressive slide-by-slide streaming,
 * and targeted per-slide LLM lint self-repair (SKILL.md §1–§8).
 */
import {
  compileDeck,
  lintDeck,
  listStudyModules,
  parseStudyManifest,
  skeletonOf,
  type StudyManifest,
  type StudyPageSpec,
  type StudySlide,
} from '@genoffice/pipelines/slides/study-aula'
import type { AiSettings, AiStreamChunk } from '../../shared/ipc'
import { normalizeManifestJson } from './aula-normalize'

export interface AulaAiBridge {
  aiStream: (req: {
    requestId: string
    settings?: AiSettings
    system: string
    messages: { role: 'user' | 'assistant'; text: string }[]
    maxTokens?: number
  }) => Promise<void>
  onAiStream: (listener: (chunk: AiStreamChunk) => void) => () => void
}

export interface CurveSection {
  heading: string
  blocks: string[]
}

/** Build the full 35-module catalog + skeletons from the StudyDeck v3 motor. */
export function buildStudySystemPrompt(): string {
  const modules = listStudyModules()
  const catalogLines = modules.map(({ module, when }) => {
    const skel = JSON.stringify(skeletonOf(module))
    return `- ${module} (quando usar: ${when}):\n  ${skel}`
  })

  return [
    'Você é o arquiteto de apresentações acadêmicas StudyDeck v3 (paleta UCP, Montserrat, WCAG AA, 35 módulos).',
    'Sua tarefa é transformar o material-fonte em slides JSON seguindo ESTRITAMENTE os contratos abaixo.',
    '',
    '## Princípios Obrigatórios (SKILL.md)',
    '1. Escolha cada módulo pelo seu `when` (a forma do conteúdo dita o módulo; use variedade entre os 35 módulos).',
    '2. Escreva a ~85-90% do limite de caracteres (`<= N car.>`) de cada campo. NUNCA ultrapasse o limite.',
    '3. NUNCA deixe marcadores `<= N car.>` no JSON final.',
    '4. NÃO coloque coordenadas x/y/w/h nem códigos hex de cor.',
    '5. Layer A (léxico de domínio travado): preserve os termos técnicos, fármacos e mecanismos exatos da fonte.',
    '6. Layer B (linguagem conectiva sóbria): use verbos operacionais diretos no indicativo (liga-se a, inibe, reduz, eleva, bloqueia, converte).',
    '   - PROIBIDO muletas ("É importante destacar", "Vale ressaltar", "Nesse cenário").',
    '   - PROIBIDO metáforas ("arsenal", "trincheira", "blindar", "deflagrar", "orquestrar", "colossal", "dramático").',
    '   - PROIBIDO quantificadores vagos ("diversos", "vários", "inúmeros", "entre outros", "em geral", "etc").',
    '   - PROIBIDO rabo de particípio após vírgula (", gerando", ", causando", ", provocando", ", levando a", ", resultando em").',
    '   - PROIBIDO termo clínico figurado sem qualificador ("colapso" só é válido como "colapso hemodinâmico", "colapso cardiogênico" ou "colapso cardiovascular").',
    '7. Pegadinhas de contrato:',
    '   - `comparison_table`: a 1ª coluna de `headers` É a coluna de critério; cada linha de `rows` tem exatamente `headers.length` células (3-4 colunas, 3-4 linhas). Se informar `col_widths`, deve ter exatamente `headers.length` números.',
    '   - `flow_diagram`: exatamente 1 passo com `"highlight": true`. Se não houver ramificação binária, NÃO coloque `"decision": true`.',
    '   - `algorithm` e `pyramid`: no máximo 1 item com `"highlight": true` (0 ou 1).',
    '   - `etymology`: `fragments` deve concatenar exatamente em `term` e ter o mesmo tamanho de `roots`.',
    '   - `mnemonic_card`: `expansion` deve ter exatamente `acronym.length` strings.',
    '   - `colloquy`: `speaker` deve ser exatamente `"tutor"` ou `"student"`.',
    '   - `learning_objectives`: `bloom` deve ser um de `remember|understand|apply|analyze|evaluate|create`.',
    '   - Evite os módulos `figure` e `authority_card` a menos que o material forneça um caminho de imagem explícito.',
    '',
    '## Catálogo Completo dos 35 Módulos e Contratos (Esqueleto JSON com limites máximos de caracteres):',
    ...catalogLines,
  ].join('\n')
}

/**
 * Extracts completed slide objects `{ "module": ... }` from an in-flight partial JSON stream
 * so slides can be compiled and rendered progressively while the stream is still arriving.
 */
export function extractCompletedSlidesFromPartialJson(raw: string): StudySlide[] {
  const slidesIdx = raw.indexOf('"slides"')
  if (slidesIdx === -1) return []
  const bracketIdx = raw.indexOf('[', slidesIdx)
  if (bracketIdx === -1) return []

  const out: StudySlide[] = []
  let depth = 0
  let inString = false
  let escape = false
  let objStart = -1

  for (let i = bracketIdx + 1; i < raw.length; i++) {
    const ch = raw[i]!
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\' && inString) {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (ch === '{') {
      if (depth === 0) objStart = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && objStart !== -1) {
        const slice = raw.slice(objStart, i + 1)
        try {
          const parsed = JSON.parse(slice) as Record<string, unknown>
          if (parsed && typeof parsed.module === 'string') {
            const norm = JSON.parse(
              normalizeManifestJson(JSON.stringify({ course: { course: 'X' }, slides: [parsed] })),
            ) as { slides: StudySlide[] }
            if (norm.slides[0]) out.push(norm.slides[0])
          }
        } catch {
          // ignore incomplete or malformed object
        }
        objStart = -1
      }
    } else if (ch === ']' && depth === 0) {
      break
    }
  }
  return out
}

function callAiStream(
  bridge: AulaAiBridge,
  settings: AiSettings | null | undefined,
  system: string,
  user: string,
  onDelta?: (fullTextSoFar: string) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const requestId = `study-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    let buf = ''
    const cleanup = bridge.onAiStream((chunk) => {
      if (chunk.requestId !== requestId) return
      if (chunk.type === 'delta') {
        buf += chunk.text
        onDelta?.(buf)
      } else if (chunk.type === 'done') {
        cleanup()
        resolve(buf)
      } else if (chunk.type === 'error') {
        cleanup()
        reject(new Error(chunk.error ?? 'AI stream error'))
      }
    })
    bridge
      .aiStream({
        requestId,
        settings: settings ?? undefined,
        system,
        messages: [{ role: 'user', text: user }],
      })
      .catch((err) => {
        cleanup()
        reject(err)
      })
  })
}

/**
 * Repairs only the specific slides in a manifest that have `lintDeck` errors,
 * running per-slide LLM repair calls in parallel without truncating or inventing content.
 */
export async function repairManifestSlidesWithAi(opts: {
  bridge: AulaAiBridge
  settings?: AiSettings | null
  manifest: StudyManifest
  onStatus?: (status: string) => void
}): Promise<StudyManifest> {
  const { bridge, settings, manifest, onStatus } = opts
  const lang = manifest.config?.lang ?? 'pt-BR'
  const slides = [...manifest.slides]

  const offendingIndices: { index: number; slide: StudySlide; errors: string[] }[] = []
  slides.forEach((slide, index) => {
    const errs = lintDeck([slide], lang)
    if (errs.length > 0) {
      offendingIndices.push({ index, slide, errors: errs })
    }
  })

  if (offendingIndices.length === 0) return manifest

  onStatus?.(`Ajustando ${offendingIndices.length} slide(s) com IA para cumprir o contrato...`)

  const repairSystem = [
    'Você é o revisor de contratos StudyDeck v3.',
    'Receberá um único slide JSON e a lista exata de violações de contrato/estilo (`lintDeck`).',
    'Reescreva APENAS os campos necessários para eliminar TODAS as violações:',
    '- Se um campo excedeu o limite de caracteres, reescreva a frase de forma mais concisa (~85% do limite) mantendo 100% do sentido técnico e o ciclo causal completo (NUNCA corte uma frase no meio).',
    '- Se faltou um campo obrigatório ou item de lista (ex.: `key_points` em `definition`, `narrative_blocks` em `stat_card`), preencha-o com base no próprio conteúdo do slide.',
    '- Se houve erro `STYLE_*` ou `drift`, substitua o termo banido ou rabo de particípio por verbo operacional direto no indicativo.',
    '- Retorne ESTRITAMENTE o objeto JSON do slide corrigido `{ "module": ... }`, sem markdown e sem explicações.',
  ].join('\n')

  await Promise.all(
    offendingIndices.map(async ({ index, slide, errors }) => {
      const skel = JSON.stringify(skeletonOf(slide.module), null, 2)
      const userPrompt = [
        `Esqueleto e limites do módulo "${slide.module}":`,
        skel,
        '',
        'Violações detectadas pelo lint:',
        ...errors.map((e) => `- ${e}`),
        '',
        'Slide atual para corrigir:',
        JSON.stringify(slide, null, 2),
      ].join('\n')

      try {
        const res = await callAiStream(bridge, settings, repairSystem, userPrompt)
        const match = res.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0]) as Record<string, unknown>
          const norm = JSON.parse(
            normalizeManifestJson(JSON.stringify({ course: { course: 'X' }, slides: [parsed] })),
          ) as { slides: StudySlide[] }
          if (norm.slides[0]) {
            slides[index] = norm.slides[0]
          }
        }
      } catch {
        // keep original slide if repair stream fails
      }
    }),
  )

  return {
    ...manifest,
    slides,
  }
}

/**
 * Generates a complete StudyDeck v3 manifest in parallel across section batches,
 * streaming slides progressively to the UI & canvas as they arrive, followed by
 * automatic targeted LLM repair for any slide that violates a contract.
 */
export async function generateStudyDeckParallel(opts: {
  bridge: AulaAiBridge
  settings?: AiSettings | null
  sourceText: string
  sections: CurveSection[]
  onProgress: (manifestJson: string, compiledPages: StudyPageSpec[], status: string) => void
}): Promise<string> {
  const { bridge, settings, sourceText, sections, onProgress } = opts
  const systemPrompt = buildStudySystemPrompt()

  const courseTitle =
    sections[0]?.heading ||
    sourceText
      .split(/\r?\n/)
      .find((l) => l.trim())
      ?.replace(/^#+\s*/, '')
      .replace(/[:.]$/, '')
      .slice(0, 70) ||
    'Aula Acadêmica'

  // Split sections into up to 4 parallel batches (max 3-4 sections per batch)
  const batchSize = Math.max(2, Math.ceil(sections.length / 4))
  const batches: CurveSection[][] = []
  for (let i = 0; i < sections.length; i += batchSize) {
    batches.push(sections.slice(i, i + batchSize))
  }
  if (batches.length === 0) {
    batches.push([{ heading: courseTitle, blocks: [sourceText] }])
  }

  const batchSlides: StudySlide[][] = batches.map(() => [])
  let completedBatches = 0

  const emitProgress = (statusPrefix: string) => {
    const flatSlides = batchSlides.flat()
    if (flatSlides.length === 0) return
    const currentManifest: StudyManifest = {
      course: { course: courseTitle, institution: 'UCP' },
      config: { lang: 'pt-BR' },
      slides: flatSlides,
    }
    const jsonStr = JSON.stringify(currentManifest, null, 2)
    // Compile all slides that are structurally valid so far for progressive canvas display
    const safePages: StudyPageSpec[] = []
    for (const s of flatSlides) {
      try {
        const c = compileDeck({
          course: currentManifest.course,
          config: currentManifest.config,
          slides: [s],
        })
        if (c[0]?.page) safePages.push(c[0].page)
      } catch {
        // skip slide if incomplete
      }
    }
    onProgress(jsonStr, safePages, `${statusPrefix} (${flatSlides.length} slides)...`)
  }

  onProgress('', [], `Gerando ${batches.length} blocos em paralelo...`)

  await Promise.all(
    batches.map(async (batchSections, batchIdx) => {
      const sectionDump = batchSections
        .map((s) => `## ${s.heading}\n${s.blocks.map((b) => `- ${b}`).join('\n')}`)
        .join('\n\n')

      const batchInstruction =
        batchIdx === 0
          ? [
              `Gere o bloco inicial (Bloco 1 de ${batches.length}) do manifesto StudyDeck JSON.`,
              `O primeiro slide DEVE ser {"module": "title", "title": ${JSON.stringify(courseTitle)}, ...}.`,
              'Em seguida, crie 1 slide por seção abaixo escolhendo o módulo ideal dentre os 35 módulos.',
              'Retorne APENAS JSON no formato: { "slides": [ ... ] }',
              '',
              'Seções deste bloco:',
              sectionDump,
            ].join('\n')
          : [
              `Gere o Bloco ${batchIdx + 1} de ${batches.length} do manifesto StudyDeck JSON.`,
              'NÃO inclua slide "title" neste bloco (já está no Bloco 1).',
              'Crie 1 slide por seção abaixo escolhendo o módulo ideal dentre os 35 módulos.',
              'Retorne APENAS JSON no formato: { "slides": [ ... ] }',
              '',
              'Seções deste bloco:',
              sectionDump,
            ].join('\n')

      const rawResponse = await callAiStream(
        bridge,
        settings,
        systemPrompt,
        batchInstruction,
        (partialText) => {
          const partialSlides = extractCompletedSlidesFromPartialJson(partialText)
          if (partialSlides.length > batchSlides[batchIdx]!.length) {
            batchSlides[batchIdx] = partialSlides
            emitProgress(`Gerando em paralelo`)
          }
        },
      )

      const finalSlides = extractCompletedSlidesFromPartialJson(rawResponse)
      if (finalSlides.length > 0) {
        batchSlides[batchIdx] = finalSlides
      }
      completedBatches++
      emitProgress(`Bloco ${completedBatches}/${batches.length} concluído`)
    }),
  )

  let mergedManifest: StudyManifest = {
    course: { course: courseTitle, institution: 'UCP' },
    config: { lang: 'pt-BR' },
    slides: batchSlides.flat(),
  }

  // Up to 2 targeted parallel LLM self-correction passes if any slide has a contract or Layer B error
  for (let pass = 1; pass <= 2; pass++) {
    const errs = lintDeck(mergedManifest.slides, 'pt-BR')
    if (errs.length === 0) break
    mergedManifest = await repairManifestSlidesWithAi({
      bridge,
      settings,
      manifest: mergedManifest,
      onStatus: (st) => emitProgress(st),
    })
  }

  const finalJson = JSON.stringify(mergedManifest, null, 2)
  const parsed = parseStudyManifest(finalJson)
  const finalPages = parsed.ok ? compileDeck(parsed.manifest).map((r) => r.page) : []
  onProgress(finalJson, finalPages, 'Concluído!')
  return finalJson
}
