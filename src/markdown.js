import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token.mjs'
import hljs from 'highlight.js/lib/common'
import footnote from 'markdown-it-footnote'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import { cleanInlineMarkdown, makeUniqueSlug } from './document'

hljs.registerAliases(['vue'], { languageName: 'xml' })

function resolveLanguage(info) {
  const [rawLanguage = ''] = String(info || '').trim().split(/\s+/)
  const normalizedLanguage = rawLanguage.toLowerCase()

  return normalizedLanguage && hljs.getLanguage(normalizedLanguage) ? normalizedLanguage : null
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(code, lang) {
    const language = resolveLanguage(lang)
    const shouldAutoDetect = !language && Boolean(String(lang || '').trim())
    const languageClass = language ? `language-${language}` : shouldAutoDetect ? 'language-auto' : 'language-plaintext'

    try {
      const highlighted = language
        ? hljs.highlight(code, { language, ignoreIllegals: true }).value
        : shouldAutoDetect
          ? hljs.highlightAuto(code).value
          : md.utils.escapeHtml(code)

      return `<pre><code class="hljs ${languageClass}">${highlighted}</code></pre>`
    } catch {
      return `<pre><code class="hljs language-plaintext">${md.utils.escapeHtml(code)}</code></pre>`
    }
  },
})

md.enable(['table', 'strikethrough'])
md.use(footnote)
md.use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: {
    throwOnError: false,
    strict: false,
    output: 'html',
  },
})

const defaultFenceRenderer = md.renderer.rules.fence

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const language = String(token.info || '').trim().split(/\s+/)[0].toLowerCase()

  if (language === 'mermaid') {
    return `<div class="mermaid">${md.utils.escapeHtml(token.content)}</div>\n`
  }

  return defaultFenceRenderer(tokens, idx, options, env, self)
}

md.core.ruler.after('inline', 'heading_anchors', (state) => {
  const used = new Map()

  for (let index = 0; index < state.tokens.length; index += 1) {
    const token = state.tokens[index]
    if (token.type !== 'heading_open') continue

    const inline = state.tokens[index + 1]
    const title = cleanInlineMarkdown(inline?.content || '')
    token.attrSet('id', makeUniqueSlug(title, used))
  }
})

md.core.ruler.after('inline', 'task_list_items', (state) => {
  const itemStack = []

  for (const token of state.tokens) {
    if (token.type === 'list_item_open') {
      itemStack.push(token)
      continue
    }

    if (token.type === 'list_item_close') {
      itemStack.pop()
      continue
    }

    if (token.type !== 'inline' || !itemStack.length || !token.children?.length) {
      continue
    }

    const firstText = token.children.find((child) => child.type === 'text' && child.content)
    const match = firstText?.content.match(/^\[([ xX])\]\s+/)

    if (!match) continue

    const listItem = itemStack[itemStack.length - 1]
    const checked = match[1].toLowerCase() === 'x'
    const line = Number.isInteger(token.map?.[0]) ? token.map[0] : ''
    const checkbox = new Token('html_inline', '', 0)

    checkbox.content = `<input class="task-list-checkbox" type="checkbox" data-task-line="${line}"${checked ? ' checked' : ''}> `
    firstText.content = firstText.content.slice(match[0].length)
    listItem.attrJoin('class', 'task-list-item')
    token.children.unshift(checkbox)
  }
})

export function renderMarkdown(source) {
  return md.render(source || '')
}
