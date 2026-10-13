import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AulaPanel } from '../src/renderer/ai/AulaPanel'

function mount(element: React.ReactElement): { container: HTMLElement; root: Root; cleanup: () => void } {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(element))
  return {
    container,
    root,
    cleanup: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

describe('Aula panel (Fase 3: material → curva → lint → build)', () => {
  let cleanup: () => void = () => {}
  afterEach(() => cleanup())

  it('shows source, curve headings and Layer B rows', () => {
    const mounted = mount(
      createElement(AulaPanel, {
        sourceLabel: 'fonte.md',
        sections: [{ heading: '1. Inflamação aguda' }, { heading: '2. Mediadores' }],
        layerB: [
          {
            loc: 'slide 1 [definition].main_statement',
            code: 'STYLE_CRUTCH',
            message: 'estilo [STYLE_CRUTCH]',
          },
        ],
      }),
    )
    cleanup = mounted.cleanup
    const { container } = mounted
    expect(container.querySelector('[data-testid="aula-panel"]')?.textContent).toMatch(/Modo Aula/)
    expect(container.querySelector('[data-testid="aula-material"]')?.textContent).toContain('fonte.md')
    expect(container.querySelector('[data-testid="aula-curve"]')?.textContent).toContain(
      '1. Inflamação aguda',
    )
    expect(container.querySelector('[data-testid="aula-lint"]')?.textContent).toContain('STYLE_CRUTCH')
    expect(container.textContent).not.toContain('cover_typography_hero')
  })

  it('blocks build while Layer B has hits', () => {
    const onBuild = vi.fn()
    const mounted = mount(
      createElement(AulaPanel, {
        sourceLabel: 'fonte.md',
        sections: [{ heading: '1. Inflamação aguda' }],
        layerB: [{ loc: 'slide 1', code: 'STYLE_CRUTCH', message: 'x' }],
        onBuild,
      }),
    )
    cleanup = mounted.cleanup
    const btn = mounted.container.querySelector<HTMLButtonElement>('[data-testid="aula-build"]')
    expect(btn?.disabled).toBe(true)
    act(() => btn?.click())
    expect(onBuild).not.toHaveBeenCalled()
  })

  it('enables build when lint is clean', () => {
    const onBuild = vi.fn()
    const mounted = mount(
      createElement(AulaPanel, {
        sourceLabel: 'fonte.md',
        sections: [{ heading: '1. Inflamação aguda' }],
        layerB: [],
        onBuild,
      }),
    )
    cleanup = mounted.cleanup
    const btn = mounted.container.querySelector<HTMLButtonElement>('[data-testid="aula-build"]')
    expect(btn?.disabled).toBe(false)
    act(() => btn?.click())
    expect(onBuild).toHaveBeenCalledTimes(1)
  })
})
