import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
import texmath from 'markdown-it-texmath'
import katex from 'katex'

hljs.registerAliases(['vue'], { languageName: 'xml' })

function resolveLanguage(info) {
  const [rawLanguage = ''] = String(info || '').trim().split(/\s+/)
  const normalizedLanguage = rawLanguage.toLowerCase()

  return normalizedLanguage && hljs.getLanguage(normalizedLanguage) ? normalizedLanguage : null
}

const md = new MarkdownIt({
  html: false,
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
md.use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: {
    throwOnError: false,
    strict: false,
    output: 'html',
  },
})

export function renderMarkdown(source) {
  return md.render(source || '')
}
