import React from 'react'

export interface AulaLayerBRow {
  loc: string
  code: string
  message: string
}

export interface AulaPanelProps {
  sourceLabel: string
  sections: { heading: string }[]
  layerB: AulaLayerBRow[]
  onBuild?: () => void
  canBuild?: boolean
  sourceText?: string
  onSourceChange?: (text: string) => void
  manifestText?: string
  onManifestChange?: (text: string) => void
  fillBrief?: string
  onGenerateWithAi?: () => void
  generating?: boolean
  statusText?: string
  onRepairWithAi?: () => void
}

/** Fase 3 — material → curva → lint Layer B visível → build. No marketing outline. */
export function AulaPanel({
  sourceLabel,
  sections,
  layerB,
  onBuild,
  canBuild,
  sourceText,
  onSourceChange,
  manifestText,
  onManifestChange,
  fillBrief,
  onGenerateWithAi,
  generating,
  statusText,
  onRepairWithAi,
}: AulaPanelProps) {
  const blocked = layerB.length > 0 || canBuild === false
  return (
    <aside className="aula-panel" data-testid="aula-panel">
      <h2>Modo Aula</h2>
      <section data-testid="aula-material">
        <h3>Material</h3>
        {onSourceChange ? (
          <textarea
            data-testid="aula-source"
            value={sourceText ?? ''}
            onChange={(e) => onSourceChange(e.target.value)}
            placeholder={sourceLabel || 'fonte.md'}
          />
        ) : (
          <p>{sourceLabel}</p>
        )}
      </section>
      <section data-testid="aula-curve">
        <h3>Curva</h3>
        <ol>
          {sections.map((s) => (
            <li key={s.heading}>{s.heading}</li>
          ))}
        </ol>
        {onGenerateWithAi ? (
          <button
            type="button"
            className="aula-ai-btn"
            disabled={generating || sections.length === 0}
            onClick={onGenerateWithAi}
          >
            {generating ? `✨ ${statusText || 'Gerando em paralelo...'}` : '✨ Gerar Slides com IA (Paralelo)'}
          </button>
        ) : null}
        {fillBrief ? (
          <pre data-testid="aula-fill-brief">{fillBrief}</pre>
        ) : null}
      </section>
      <section data-testid="aula-lint">
        <h3>Lint Layer B</h3>
        {onManifestChange ? (
          <textarea
            data-testid="aula-manifest"
            value={manifestText ?? ''}
            onChange={(e) => onManifestChange(e.target.value)}
            placeholder="manifest.json"
          />
        ) : null}
        {layerB.length > 0 && onRepairWithAi ? (
          <button
            type="button"
            className="aula-ai-btn"
            disabled={generating}
            onClick={onRepairWithAi}
          >
            {generating
              ? `✨ ${statusText || 'Revisando slides com IA...'}`
              : `✨ Corrigir ${layerB.length} Violação(ões) com IA`}
          </button>
        ) : null}
        {layerB.length === 0 ? (
          <p>PASS</p>
        ) : (
          <ul>
            {layerB.map((row, i) => (
              <li key={`${row.loc}-${i}`} data-code={row.code}>
                {row.loc}: {row.code} — {row.message}
              </li>
            ))}
          </ul>
        )}
      </section>
      <button type="button" data-testid="aula-build" disabled={blocked} onClick={onBuild}>
        Build
      </button>
    </aside>
  )
}
