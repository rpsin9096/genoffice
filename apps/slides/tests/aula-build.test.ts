import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

const CLEAN = JSON.stringify({
  course: { course: 'Fisiopatologia' },
  config: { lang: 'pt-BR' },
  slides: [
    {
      module: 'title',
      title: 'Fisiopatologia da inflamação aguda',
      subtitle: 'Do estímulo lesivo à resolução',
      course: 'Fisiopatologia',
      institution: 'UCP',
    },
  ],
})

describe('Aula Build in the dock', () => {
  let cleanup: () => void = () => {}
  afterEach(() => cleanup())

  it('emits compiled page specs when lint is clean', () => {
    const onAulaBuild = vi.fn()
    const mounted = mount(
      createElement(
        StudyAulaShell,
        { onAulaBuild },
        createElement('div', { 'data-testid': 'chat-child' }),
      ),
    )
    cleanup = mounted.cleanup
    act(() => mounted.container.querySelector<HTMLButtonElement>('[data-testid="aula-tab"]')!.click())
    typeInto(mounted.container.querySelector<HTMLTextAreaElement>('[data-testid="aula-manifest"]')!, CLEAN)
    const btn = mounted.container.querySelector<HTMLButtonElement>('[data-testid="aula-build"]')
    expect(btn?.disabled).toBe(false)
    act(() => btn!.click())
    expect(onAulaBuild).toHaveBeenCalledTimes(1)
    const pages = onAulaBuild.mock.calls[0]![0] as { layout: string }[]
    expect(pages[0]!.layout).toBe('study_title')
  })
})
