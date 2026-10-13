import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { StudyAulaShell } from '../src/renderer/ai/StudyAulaShell'

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

const aula = {
  sourceLabel: 'fonte.md',
  sections: [{ heading: '1. Inflamação aguda' }],
  layerB: [] as { loc: string; code: string; message: string }[],
}

describe('StudyAulaShell (Chat | Aula in the Slides dock)', () => {
  let cleanup: () => void = () => {}
  afterEach(() => cleanup())

  it('starts on Chat and keeps the chat child mounted', () => {
    const mounted = mount(
      createElement(StudyAulaShell, { aula }, createElement('div', { 'data-testid': 'chat-child' }, 'chat')),
    )
    cleanup = mounted.cleanup
    const { container } = mounted
    expect(container.querySelector('[data-testid="aula-panel"]')).toBeNull()
    const child = container.querySelector('[data-testid="chat-child"]')
    expect(child).not.toBeNull()
    expect(child?.closest('[hidden]')).toBeNull()
  })

  it('shows Aula on tab click without unmounting chat', () => {
    const mounted = mount(
      createElement(StudyAulaShell, { aula }, createElement('div', { 'data-testid': 'chat-child' }, 'chat')),
    )
    cleanup = mounted.cleanup
    const tab = mounted.container.querySelector<HTMLButtonElement>('[data-testid="aula-tab"]')
    expect(tab).not.toBeNull()
    act(() => tab!.click())
    expect(mounted.container.querySelector('[data-testid="aula-panel"]')?.textContent).toContain(
      'Modo Aula',
    )
    expect(mounted.container.querySelector('[data-testid="aula-curve"]')?.textContent).toContain(
      'Inflamação aguda',
    )
    const child = mounted.container.querySelector('[data-testid="chat-child"]')
    expect(child).not.toBeNull()
    expect(child?.closest('[hidden]')).not.toBeNull()
  })
})
