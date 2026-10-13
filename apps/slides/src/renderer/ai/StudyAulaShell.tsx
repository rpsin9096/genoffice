import {
  aulaBuild,
  aulaSession,
  fillBrief,
  parseStudyManifest,
  type StudyPageSpec,
} from '@genoffice/pipelines/slides/study-aula'
import React, { useMemo, useRef, useState } from 'react'
import { AulaPanel, type AulaPanelProps } from './AulaPanel'
import { generateStudyDeckParallel, repairManifestSlidesWithAi } from './aula-ai'
import { normalizeManifestJson } from './aula-normalize'

export interface StudyAulaShellProps {
  aula?: AulaPanelProps
  children: React.ReactNode
  onAulaBuild?: (pages: StudyPageSpec[]) => void
  aiSettings?: import('../../shared/ipc').AiSettings | null
}

/** Chat stays mounted (in-flight runs survive). Aula is a tab, not a second dock. */
export function StudyAulaShell({ aula, children, onAulaBuild, aiSettings }: StudyAulaShellProps) {
  const [tab, setTab] = useState<'chat' | 'aula'>('chat')
  const [sourceText, setSourceText] = useState('')
  const [manifestText, setManifestText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [statusText, setStatusText] = useState('')
  const lastRenderedCountRef = useRef(0)

  const session = useMemo(
    () => aulaSession({ sourceText, sourceLabel: 'fonte.md', manifestJson: manifestText }),
    [sourceText, manifestText],
  )

  const handleGenerateWithAi = async () => {
    if (!window.slidesApi || generating) return
    setGenerating(true)
    setStatusText('Iniciando geração paralela...')
    lastRenderedCountRef.current = 0

    try {
      const finalJson = await generateStudyDeckParallel({
        bridge: window.slidesApi,
        settings: aiSettings,
        sourceText,
        sections: session.curve.sections,
        onProgress: (manifestJson, compiledPages, status) => {
          setStatusText(status)
          if (manifestJson) {
            setManifestText(manifestJson)
          }
          // Progressive canvas rendering: whenever a new slide is compiled, land it on the canvas
          if (compiledPages.length > lastRenderedCountRef.current) {
            lastRenderedCountRef.current = compiledPages.length
            onAulaBuild?.(compiledPages)
          }
        },
      })

      setManifestText(finalJson)
      const built = aulaBuild({ sourceText, sourceLabel: 'fonte.md', manifestJson: finalJson })
      if (built.ok) {
        onAulaBuild?.(built.pages)
      }
    } finally {
      setGenerating(false)
      setStatusText('')
    }
  }

  const handleRepairWithAi = async () => {
    if (!window.slidesApi || generating) return
    const normStr = normalizeManifestJson(manifestText)
    const parsed = parseStudyManifest(normStr)
    if (!parsed.ok) return

    setGenerating(true)
    setStatusText('Revisando slides com IA...')
    try {
      const repaired = await repairManifestSlidesWithAi({
        bridge: window.slidesApi,
        settings: aiSettings,
        manifest: parsed.manifest,
        onStatus: (st) => setStatusText(st),
      })
      const repairedJson = JSON.stringify(repaired, null, 2)
      setManifestText(repairedJson)
      const built = aulaBuild({ sourceText, sourceLabel: 'fonte.md', manifestJson: repairedJson })
      if (built.ok) {
        onAulaBuild?.(built.pages)
      }
    } finally {
      setGenerating(false)
      setStatusText('')
    }
  }

  const live: AulaPanelProps = aula ?? {
    sourceLabel: session.sourceLabel,
    sections: session.curve.sections,
    layerB: session.layerB,
    canBuild: session.canBuild,
    sourceText,
    onSourceChange: setSourceText,
    manifestText,
    onManifestChange: (text) => setManifestText(normalizeManifestJson(text)),
    fillBrief: fillBrief(session),
    onGenerateWithAi: handleGenerateWithAi,
    generating,
    statusText,
    onRepairWithAi: handleRepairWithAi,
    onBuild: () => {
      const normalized = normalizeManifestJson(manifestText)
      const r = aulaBuild({ sourceText, sourceLabel: 'fonte.md', manifestJson: normalized })
      if (r.ok) onAulaBuild?.(r.pages)
    },
  }
  return (
    <div className="aula-shell" data-testid="aula-shell">
      <div className="aula-shell-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          data-testid="chat-tab"
          aria-selected={tab === 'chat'}
          onClick={() => setTab('chat')}
        >
          Chat
        </button>
        <button
          type="button"
          role="tab"
          data-testid="aula-tab"
          aria-selected={tab === 'aula'}
          onClick={() => setTab('aula')}
        >
          Aula
        </button>
      </div>
      <div hidden={tab !== 'chat'}>{children}</div>
      {tab === 'aula' ? <AulaPanel {...live} /> : null}
    </div>
  )
}
