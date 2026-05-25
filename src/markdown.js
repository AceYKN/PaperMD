import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import texmath from 'markdown-it-texmath'
import katex from 'katex'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('python', python)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('vue', xml)

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(code, lang) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    const languageClass = language === 'plaintext' ? 'language-plaintext' : `language-${language}`

    try {
      const highlighted = language === 'plaintext'
        ? md.utils.escapeHtml(code)
        : hljs.highlight(code, { language }).value

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
