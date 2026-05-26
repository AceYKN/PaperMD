const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g
const HEADING_RE = /^(#{1,3})\s+(.+?)\s*#*\s*$/
const H1_RE = /^#\s+(.+?)\s*#*\s*$/

export const DEFAULT_DOCUMENT_TITLE = 'Untitled document'

export const FONT_FAMILIES = {
  system:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  song:
    '"Songti SC", "SimSun", "Noto Serif CJK SC", Georgia, "Times New Roman", serif',
  hei:
    '"Heiti SC", "Microsoft YaHei", "PingFang SC", Arial, sans-serif',
  serif:
    'ui-serif, Georgia, "Times New Roman", "Songti SC", "SimSun", serif',
  sans:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
  mono:
    '"SFMono-Regular", Consolas, "Liberation Mono", "Cascadia Code", monospace',
}

export const EXPORT_PRESETS = {
  paper: {
    pageSize: 'A4',
    margins: { top: 24, right: 22, bottom: 24, left: 22 },
    fontSize: 15,
    lineHeight: 1.9,
    fontFamily: 'song',
    theme: 'minimal',
    headingStyle: 'formal',
  },
  report: {
    pageSize: 'A4',
    margins: { top: 20, right: 18, bottom: 20, left: 18 },
    fontSize: 16,
    lineHeight: 1.75,
    fontFamily: 'system',
    theme: 'github',
    headingStyle: 'ruled',
  },
  resume: {
    pageSize: 'A4',
    margins: { top: 14, right: 14, bottom: 14, left: 14 },
    fontSize: 14,
    lineHeight: 1.45,
    fontFamily: 'sans',
    theme: 'minimal',
    headingStyle: 'compact',
  },
  handout: {
    pageSize: 'A4',
    margins: { top: 16, right: 16, bottom: 16, left: 16 },
    fontSize: 17,
    lineHeight: 1.75,
    fontFamily: 'hei',
    theme: 'github',
    headingStyle: 'open',
  },
  github: {
    pageSize: 'A4',
    margins: { top: 18, right: 16, bottom: 18, left: 16 },
    fontSize: 16,
    lineHeight: 1.7,
    fontFamily: 'sans',
    theme: 'github',
    headingStyle: 'ruled',
  },
}

export function cleanInlineMarkdown(value) {
  return String(value || '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractDocumentTitle(source, fallback = DEFAULT_DOCUMENT_TITLE) {
  const lines = String(source || '').split(/\r?\n/)
  let inFence = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence
      continue
    }

    if (inFence) continue

    const match = line.match(H1_RE)
    if (match) {
      return cleanInlineMarkdown(match[1]) || fallback
    }
  }

  return fallback
}

export function sanitizeFileName(value, fallback = DEFAULT_DOCUMENT_TITLE) {
  const safe = cleanInlineMarkdown(value)
    .replace(INVALID_FILENAME_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')

  return safe || fallback
}

export function buildExportFileName(source, extension, fallback = DEFAULT_DOCUMENT_TITLE) {
  const normalizedExtension = String(extension || '').replace(/^\./, '') || 'md'
  const title = extractDocumentTitle(source, fallback)

  return `${sanitizeFileName(title, fallback)}.${normalizedExtension}`
}

export function makeUniqueSlug(title, used = new Map()) {
  const base =
    cleanInlineMarkdown(title)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  const nextCount = (used.get(base) || 0) + 1
  used.set(base, nextCount)

  return nextCount === 1 ? base : `${base}-${nextCount}`
}

export function extractHeadings(source) {
  const used = new Map()
  let inFence = false

  return String(source || '')
    .split(/\r?\n/)
    .reduce((headings, line, lineIndex) => {
      const trimmed = line.trim()
      if (/^(```|~~~)/.test(trimmed)) {
        inFence = !inFence
        return headings
      }

      if (inFence) return headings

      const match = line.match(HEADING_RE)
      if (!match) return headings

      const title = cleanInlineMarkdown(match[2])
      if (!title) return headings

      headings.push({
        level: match[1].length,
        title,
        slug: makeUniqueSlug(title, used),
        line: lineIndex,
      })

      return headings
    }, [])
}

export function buildTocHtml(headings = []) {
  if (!headings.length) return ''

  const items = headings
    .map(
      (heading) =>
        `<li class="toc-level-${heading.level}"><a href="#${escapeAttribute(heading.slug)}">${escapeHtml(heading.title)}</a></li>`,
    )
    .join('')

  return `<nav class="export-toc"><h1>Table of contents</h1><ol>${items}</ol></nav>`
}

export function buildHtmlDocument({
  title,
  bodyHtml,
  settings = {},
  headings = [],
  includeToc = false,
}) {
  const preset = settings.exportPreset || 'github'
  const fontFamily = FONT_FAMILIES[settings.fontFamily] || FONT_FAMILIES.sans
  const toc = includeToc ? buildTocHtml(headings) : ''
  const safeTitle = escapeHtml(title || DEFAULT_DOCUMENT_TITLE)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <style>
${buildExportCss(settings)}
  </style>
</head>
<body style="--doc-font-size: ${Number(settings.fontSize) || 16}px; --doc-line-height: ${Number(settings.lineHeight) || 1.7}; --doc-font-family: ${fontFamily};">
  ${toc}
  <main class="markdown-body preset-${escapeAttribute(preset)}">${bodyHtml || ''}</main>
  <script type="module">
    const blocks = document.querySelectorAll('.mermaid')
    if (blocks.length) {
      import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then(({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: 'default' })
        mermaid.run({ nodes: blocks })
      })
    }
  </script>
</body>
</html>`
}

export function buildExportCss(settings = {}) {
  const preset = settings.exportPreset || 'github'

  return `
    :root {
      color: #1f2933;
      background: #ffffff;
      font-family: var(--doc-font-family);
      font-size: var(--doc-font-size);
      line-height: var(--doc-line-height);
    }
    body {
      max-width: 860px;
      margin: 32px auto;
      padding: 0 24px;
      color: #1f2933;
      background: #ffffff;
    }
    .markdown-body {
      font-family: var(--doc-font-family);
      font-size: var(--doc-font-size);
      line-height: var(--doc-line-height);
      overflow-wrap: anywhere;
    }
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3 {
      color: #111827;
      line-height: 1.25;
    }
    .markdown-body h1 {
      margin: 0 0 22px;
      padding-bottom: ${preset === 'paper' || preset === 'resume' ? '0' : '12px'};
      border-bottom: ${preset === 'paper' || preset === 'resume' ? '0' : '1px solid #d9e1e8'};
      font-size: ${preset === 'resume' ? '1.55em' : '2em'};
    }
    .markdown-body h2 {
      margin: ${preset === 'resume' ? '18px' : '30px'} 0 12px;
      font-size: ${preset === 'resume' ? '1.16em' : '1.45em'};
    }
    .markdown-body h3 {
      margin: 22px 0 10px;
      font-size: 1.15em;
    }
    .markdown-body p,
    .markdown-body ul,
    .markdown-body ol,
    .markdown-body blockquote,
    .markdown-body table,
    .markdown-body pre {
      margin: 0 0 1em;
    }
    .markdown-body a {
      color: #08745f;
    }
    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
    }
    .markdown-body th,
    .markdown-body td {
      padding: 8px 10px;
      border: 1px solid #d9e1e8;
    }
    .markdown-body blockquote {
      padding: 10px 14px;
      border-left: 4px solid #0f8f77;
      background: #f4f8f7;
    }
    .markdown-body pre {
      overflow: auto;
    }
    .markdown-body pre code {
      display: block;
      padding: 14px;
      border-radius: 8px;
      background: #f6f8fa;
    }
    .markdown-body img,
    .markdown-body svg {
      max-width: 100%;
      height: auto;
    }
    .export-toc {
      margin: 0 0 36px;
      padding-bottom: 24px;
      border-bottom: 1px solid #d9e1e8;
      break-after: page;
    }
    .export-toc h1 {
      margin: 0 0 16px;
      font-size: 1.6em;
    }
    .export-toc ol {
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
    .export-toc li {
      margin: 6px 0;
    }
    .export-toc .toc-level-2 {
      padding-left: 18px;
    }
    .export-toc .toc-level-3 {
      padding-left: 36px;
    }
    .export-toc a {
      color: #1f2933;
      text-decoration: none;
    }
  `
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, '&#39;')
}
