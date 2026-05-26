import { describe, expect, it } from 'vitest'
import {
  buildExportFileName,
  buildHtmlDocument,
  extractDocumentTitle,
  extractHeadings,
  makeUniqueSlug,
} from '../document.js'

describe('document helpers', () => {
  it('uses the first H1 as the document title and export file name', () => {
    const source = '## Preamble\n\n# Quarterly Report: Q1/2026\n\nBody'

    expect(extractDocumentTitle(source, 'Untitled')).toBe('Quarterly Report: Q1/2026')
    expect(buildExportFileName(source, 'md', 'Untitled')).toBe('Quarterly Report Q1 2026.md')
  })

  it('extracts h1-h3 headings with stable unique slugs and line numbers', () => {
    const source = [
      '# Intro',
      '',
      '```',
      '# Not a heading',
      '```',
      '## Intro',
      '### Details',
      '#### Ignored',
      '## Intro',
    ].join('\n')

    expect(extractHeadings(source)).toEqual([
      { level: 1, title: 'Intro', slug: 'intro', line: 0 },
      { level: 2, title: 'Intro', slug: 'intro-2', line: 5 },
      { level: 3, title: 'Details', slug: 'details', line: 6 },
      { level: 2, title: 'Intro', slug: 'intro-3', line: 8 },
    ])
  })

  it('creates duplicate-safe heading slugs', () => {
    const used = new Map()

    expect(makeUniqueSlug('Hello World!', used)).toBe('hello-world')
    expect(makeUniqueSlug('Hello World!', used)).toBe('hello-world-2')
    expect(makeUniqueSlug('   ', used)).toBe('section')
  })

  it('wraps rendered content as a standalone HTML export', () => {
    const html = buildHtmlDocument({
      title: 'PaperMD Export',
      bodyHtml: '<h1 id="papermd">PaperMD</h1>',
      settings: {
        fontSize: 16,
        lineHeight: 1.7,
        fontFamily: 'sans',
        exportPreset: 'github',
      },
      includeToc: true,
      headings: [{ level: 1, title: 'PaperMD', slug: 'papermd', line: 0 }],
    })

    expect(html).toContain('<title>PaperMD Export</title>')
    expect(html).toContain('class="export-toc"')
    expect(html).toContain('<main class="markdown-body preset-github"')
  })
})
