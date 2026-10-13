import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { StudyAulaShell } from '../src/renderer/ai/StudyAulaShell'

function mount(element: React.ReactElement): { container: HTMLElement; cleanup: () => void } {
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

describe('Aula session in the dock', () => {
  let cleanup: () => void = () => {}
  afterEach(() => cleanup())

  it('turns pasted source into curve headings', () => {
    const mounted = mount(createElement(StudyAulaShell, null, createElement('div', { 'data-testid': 'chat-child' })))
    cleanup = mounted.cleanup
    act(() => mounted.container.querySelector<HTMLButtonElement>('[data-testid="aula-tab"]')!.click())
    const src = mounted.container.querySelector<HTMLTextAreaElement>('[data-testid="aula-source"]')
    expect(src).not.toBeNull()
    typeInto(src!, '1. Inflamação aguda\nResposta vascular do tecido vivo.\n')
    expect(mounted.container.querySelector('[data-testid="aula-curve"]')?.textContent).toContain(
      'Inflamação aguda',
    )
  })
})
