import { aulaBuild, aulaSession, fillBrief, type StudyPageSpec } from '@genoffice/pipelines/slides'
import React, { useMemo, useState } from 'react'
import { AulaPanel, type AulaPanelProps } from './AulaPanel'

export interface StudyAulaShellProps {
  aula?: AulaPanelProps
  children: React.ReactNode
  onAulaBuild?: (pages: StudyPageSpec[]) => void
}

/** Chat stays mounted (in-flight runs survive). Aula is a tab, not a second dock. */
export function StudyAulaShell({ aula, children, onAulaBuild }: StudyAulaShellProps) {
  const [tab, setTab] = useState<'chat' | 'aula'>('chat')
  const [sourceText, setSourceText] = useState('')
  const [manifestText, setManifestText] = useState('')
  const session = useMemo(
    () => aulaSession({ sourceText, sourceLabel: 'fonte.md', manifestJson: manifestText }),
    [sourceText, manifestText],
  )
  const live: AulaPanelProps = aula ?? {
    sourceLabel: session.sourceLabel,
    sections: session.curve.sections,
    layerB: session.layerB,
    canBuild: session.canBuild,
    sourceText,
    onSourceChange: setSourceText,
    manifestText,
    onManifestChange: setManifestText,
    fillBrief: fillBrief(session),
    onBuild: () => {
      const r = aulaBuild({ sourceText, sourceLabel: 'fonte.md', manifestJson: manifestText })
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
