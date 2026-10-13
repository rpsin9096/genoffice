import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { StudyAulaShell } from '../src/renderer/ai/StudyAulaShell'

function mount(element: React.ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(element))
  return {
    container,
    cleanup: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

function typeInto(el: HTMLTextAreaElement, text: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
  act(() => {
    setter.call(el, text)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('Aula fill brief in the dock', () => {
  let cleanup: () => void = () => {}
  afterEach(() => cleanup())

  it('shows the BYOK brief after pasting source', () => {
    const mounted = mount(
      createElement(StudyAulaShell, null, createElement('div', { 'data-testid': 'chat-child' })),
    )
    cleanup = mounted.cleanup
    act(() => mounted.container.querySelector<HTMLButtonElement>('[data-testid="aula-tab"]')!.click())
    typeInto(
      mounted.container.querySelector<HTMLTextAreaElement>('[data-testid="aula-source"]')!,
      '1. Inflamação aguda\nResposta vascular do tecido vivo.\n',
    )
    const brief = mounted.container.querySelector('[data-testid="aula-fill-brief"]')?.textContent ?? ''
    expect(brief).toContain('Inflamação aguda')
    expect(brief.toLowerCase()).toMatch(/n[aã]o coloca x/)
  })
})
