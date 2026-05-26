import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../markdown.js'

describe('markdown renderer', () => {
  it('renders raw HTML when documents intentionally include it', () => {
    expect(renderMarkdown('<section data-test="ok">Hello</section>')).toContain('<section data-test="ok">Hello</section>')
  })

  it('adds stable heading anchors', () => {
    expect(renderMarkdown('# Hello World')).toContain('<h1 id="hello-world">Hello World</h1>')
  })

  it('renders task list checkboxes with source line metadata', () => {
    const html = renderMarkdown('- [x] Done')

    expect(html).toContain('class="task-list-item"')
    expect(html).toContain('data-task-line="0"')
    expect(html).toContain('checked')
  })

  it('renders mermaid fences as deferred diagram blocks', () => {
    const html = renderMarkdown('```mermaid\ngraph TD\nA-->B\n```')

    expect(html).toContain('<div class="mermaid">')
    expect(html).toContain('graph TD')
  })

  it('supports footnotes', () => {
    const html = renderMarkdown('Body[^1]\n\n[^1]: Note')

    expect(html).toContain('footnote-ref')
    expect(html).toContain('Note')
  })
})
