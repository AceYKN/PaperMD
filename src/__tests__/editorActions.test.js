import { describe, expect, it } from 'vitest'
import { continueMarkdownList, insertImageMarkdown, toggleTaskAtLine } from '../editorActions.js'

describe('editor actions', () => {
  it('continues unordered list items on Enter', () => {
    const source = '- first'
    const result = continueMarkdownList(source, source.length, source.length)

    expect(result).toEqual({
      text: '- first\n- ',
      selectionStart: 10,
      selectionEnd: 10,
    })
  })

  it('continues ordered list items with the next number', () => {
    const source = '9. item'
    const result = continueMarkdownList(source, source.length, source.length)

    expect(result?.text).toBe('9. item\n10. ')
    expect(result?.selectionStart).toBe(12)
  })

  it('exits an empty list item on Enter', () => {
    const source = 'Before\n- '
    const result = continueMarkdownList(source, source.length, source.length)

    expect(result).toEqual({
      text: 'Before\n',
      selectionStart: 7,
      selectionEnd: 7,
    })
  })

  it('toggles task list checkboxes by source line', () => {
    const source = '- [ ] Todo\n- [x] Done'

    expect(toggleTaskAtLine(source, 0)).toBe('- [x] Todo\n- [x] Done')
    expect(toggleTaskAtLine(source, 1)).toBe('- [ ] Todo\n- [ ] Done')
  })

  it('inserts dropped images as Markdown data URLs', () => {
    const result = insertImageMarkdown('Hello', 5, 5, 'Chart 1.png', 'data:image/png;base64,AAA')

    expect(result.text).toBe('Hello\n![Chart 1](data:image/png;base64,AAA)\n')
    expect(result.selectionStart).toBe(result.text.length)
  })
})
