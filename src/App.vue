<template>
  <div class="app-shell" :class="{ 'settings-open': isSettingsOpen }">
    <header class="topbar">
      <div class="brand" aria-label="PaperMD">
        <FileText :size="22" stroke-width="2.2" />
        <div>
          <strong>PaperMD</strong>
          <span>{{ saveStatus }}</span>
        </div>
      </div>

      <div class="topbar-actions">
        <button class="ghost-button" type="button" title="新建文档" @click="newDocument">
          <FilePlus :size="18" />
          <span>新建</span>
        </button>
        <button class="ghost-button" type="button" title="导入 Markdown 或文本文件" @click="openFilePicker">
          <Upload :size="18" />
          <span>导入</span>
        </button>
        <button class="ghost-button settings-toggle" type="button" title="打开排版设置" @click="toggleSettings">
          <SlidersHorizontal :size="18" />
          <span>排版</span>
        </button>
        <button class="primary-button" type="button" title="导出 PDF" @click="printPdf">
          <Printer :size="18" />
          <span>导出 PDF</span>
        </button>
      </div>
    </header>

    <input
      ref="fileInputRef"
      class="sr-only"
      type="file"
      accept=".md,.markdown,.txt,text/markdown,text/plain"
      @change="importFile"
    />

    <main class="workspace">
      <section class="editor-panel" :class="{ 'mobile-hidden': mobileMode !== 'edit' }" aria-label="Markdown 编辑器">
        <div class="panel-header">
          <div>
            <span class="panel-kicker">Markdown</span>
            <h1>编辑</h1>
          </div>
          <div class="document-stats">
            <span>{{ wordCount }} 字</span>
            <span>{{ lineCount }} 行</span>
          </div>
        </div>

        <div class="shortcut-toolbar" aria-label="Markdown 快捷工具栏">
          <button
            v-for="tool in toolbarTools"
            :key="tool.label"
            type="button"
            :title="tool.title"
            @click="tool.action"
          >
            <component :is="tool.icon" :size="17" />
            <span>{{ tool.label }}</span>
          </button>
        </div>

        <textarea
          ref="editorRef"
          v-model="markdown"
          class="markdown-input"
          spellcheck="false"
          aria-label="Markdown 内容"
        />
      </section>

      <section class="preview-panel" :class="{ 'mobile-hidden': mobileMode !== 'preview' }" aria-label="实时预览">
        <div class="panel-header preview-header">
          <div>
            <span class="panel-kicker">Preview</span>
            <h1>实时预览</h1>
          </div>
          <label class="theme-switch">
            <span>主题</span>
            <select v-model="settings.theme" aria-label="预览主题">
              <option value="github">GitHub</option>
              <option value="minimal">简约</option>
            </select>
          </label>
        </div>

        <article
          class="preview-document markdown-body"
          :class="`theme-${settings.theme}`"
          :style="previewStyle"
          v-html="renderedHtml"
        />
      </section>

      <aside class="settings-panel" aria-label="PDF 排版设置">
        <div class="panel-header">
          <div>
            <span class="panel-kicker">Export</span>
            <h1>PDF 排版</h1>
          </div>
          <button class="icon-button close-settings" type="button" title="关闭设置" @click="isSettingsOpen = false">
            <X :size="18" />
          </button>
        </div>

        <div class="settings-list">
          <label class="field">
            <span>页面大小</span>
            <select v-model="settings.pageSize">
              <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
            </select>
          </label>

          <div class="field-group">
            <span>页边距 mm</span>
            <div class="margin-grid">
              <label v-for="item in marginFields" :key="item.key" class="mini-field">
                <span>{{ item.label }}</span>
                <input v-model.number="settings.margins[item.key]" type="number" min="0" max="60" step="1" />
              </label>
            </div>
          </div>

          <label class="field">
            <span>正文字号 {{ settings.fontSize }}px</span>
            <input v-model.number="settings.fontSize" type="range" min="12" max="22" step="1" />
          </label>

          <label class="field">
            <span>行距 {{ settings.lineHeight.toFixed(1) }}</span>
            <input v-model.number="settings.lineHeight" type="range" min="1.2" max="2.2" step="0.1" />
          </label>
        </div>

        <div class="export-summary">
          <span>{{ settings.pageSize }}</span>
          <span>{{ settings.margins.top }} / {{ settings.margins.right }} / {{ settings.margins.bottom }} / {{ settings.margins.left }} mm</span>
          <span>{{ settings.fontSize }}px · {{ settings.lineHeight.toFixed(1) }}</span>
        </div>

        <button class="primary-button export-wide" type="button" @click="printPdf">
          <Printer :size="18" />
          <span>打开打印窗口</span>
        </button>
      </aside>
    </main>

    <nav class="mobile-tabs" aria-label="移动端模式切换">
      <button type="button" :class="{ active: mobileMode === 'edit' }" @click="mobileMode = 'edit'">
        <Edit3 :size="18" />
        <span>编辑</span>
      </button>
      <button type="button" :class="{ active: mobileMode === 'preview' }" @click="mobileMode = 'preview'">
        <Eye :size="18" />
        <span>预览</span>
      </button>
    </nav>

    <article
      class="print-only markdown-body"
      :class="`theme-${settings.theme}`"
      :style="previewStyle"
      v-html="renderedHtml"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  Bold,
  Code2,
  Edit3,
  Eye,
  FilePlus,
  FileText,
  Heading1,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Printer,
  Quote,
  Sigma,
  SlidersHorizontal,
  Table2,
  Upload,
  X,
} from '@lucide/vue'
import { renderMarkdown } from './markdown'

const STORAGE_KEY = 'papermd:last-document'
const SETTINGS_KEY = 'papermd:settings'

const sampleMarkdown = `# PaperMD 示例文档

PaperMD 是一款纯前端 Markdown 编辑器，支持实时预览、本地草稿、移动端快捷输入和浏览器原生 PDF 导出。

## 核心能力

- **实时预览**：输入后立即渲染 Markdown。
- *移动友好*：手机端可在编辑与预览之间切换。
- 支持表格、代码高亮、外链图片和数学公式。

> 导出 PDF 时会应用右侧排版设置，并调用系统打印窗口。

| 参数 | 说明 |
| --- | --- |
| 页面 | A4 / A5 / Letter |
| 边距 | 上、右、下、左独立设置 |
| 字体 | 正文字号与行距可调 |

\`\`\`js
const message = 'Hello, PaperMD'
console.log(message)
\`\`\`

行内公式示例：$E = mc^2$

块级公式示例：

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$
`

const defaultSettings = {
  pageSize: 'A4',
  theme: 'github',
  margins: {
    top: 18,
    right: 16,
    bottom: 18,
    left: 16,
  },
  fontSize: 16,
  lineHeight: 1.7,
}

const editorRef = ref(null)
const fileInputRef = ref(null)
const mobileMode = ref('edit')
const isSettingsOpen = ref(false)
const saveStatus = ref('正在读取本地草稿')
const markdown = ref(loadStoredMarkdown())
const settings = reactive(loadStoredSettings())
let saveTimer = 0
let statusTimer = 0

const pageSizes = ['A4', 'A5', 'Letter']
const marginFields = [
  { key: 'top', label: '上' },
  { key: 'right', label: '右' },
  { key: 'bottom', label: '下' },
  { key: 'left', label: '左' },
]

const renderedHtml = computed(() => renderMarkdown(markdown.value))
const wordCount = computed(() => markdown.value.replace(/\s/g, '').length)
const lineCount = computed(() => markdown.value.split('\n').length)
const previewStyle = computed(() => ({
  '--doc-font-size': `${settings.fontSize}px`,
  '--doc-line-height': settings.lineHeight,
}))

const toolbarTools = computed(() => [
  { label: 'H1', title: '一级标题', icon: Heading1, action: () => prefixLines('# ') },
  { label: 'B', title: '加粗', icon: Bold, action: () => wrapSelection('**', '**', '加粗文字') },
  { label: 'I', title: '斜体', icon: Italic, action: () => wrapSelection('*', '*', '斜体文字') },
  { label: '链接', title: '插入链接', icon: Link, action: insertLink },
  { label: '代码', title: '行内代码', icon: Code2, action: () => wrapSelection('`', '`', 'code') },
  { label: '代码块', title: '插入代码块', icon: Code2, action: insertCodeBlock },
  { label: '引用', title: '引用', icon: Quote, action: () => prefixLines('> ') },
  { label: '列表', title: '无序列表', icon: List, action: () => prefixLines('- ') },
  { label: '编号', title: '有序列表', icon: ListOrdered, action: () => prefixOrderedLines() },
  { label: '表格', title: '插入表格', icon: Table2, action: insertTable },
  { label: '图片', title: '插入图片', icon: Image, action: insertImage },
  { label: '公式', title: '插入数学公式', icon: Sigma, action: insertMath },
  { label: '分割线', title: '插入分割线', icon: Minus, action: () => insertAtCursor('\n\n---\n\n') },
])

function loadStoredMarkdown() {
  try {
    return localStorage.getItem(STORAGE_KEY) || sampleMarkdown
  } catch {
    return sampleMarkdown
  }
}

function loadStoredSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      ...defaultSettings,
      ...saved,
      margins: {
        ...defaultSettings.margins,
        ...(saved.margins || {}),
      },
    }
  } catch {
    return { ...defaultSettings, margins: { ...defaultSettings.margins } }
  }
}

function scheduleSave() {
  saveStatus.value = '正在自动保存'
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, markdown.value)
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      saveStatus.value = `已自动保存 ${new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    } catch {
      saveStatus.value = '本地保存不可用'
    }
  }, 500)
}

function focusEditor() {
  nextTick(() => {
    editorRef.value?.focus()
  })
}

function replaceRange(start, end, value, nextStart = start + value.length, nextEnd = nextStart) {
  const text = markdown.value
  markdown.value = `${text.slice(0, start)}${value}${text.slice(end)}`
  nextTick(() => {
    const textarea = editorRef.value
    if (!textarea) return
    textarea.focus()
    textarea.setSelectionRange(nextStart, nextEnd)
  })
}

function wrapSelection(before, after, placeholder) {
  const textarea = editorRef.value
  if (!textarea) return
  const { selectionStart, selectionEnd } = textarea
  const selected = markdown.value.slice(selectionStart, selectionEnd) || placeholder
  const next = `${before}${selected}${after}`
  const cursorStart = selectionStart + before.length
  const cursorEnd = cursorStart + selected.length
  replaceRange(selectionStart, selectionEnd, next, cursorStart, cursorEnd)
}

function getLineRange() {
  const textarea = editorRef.value
  if (!textarea) return null
  const text = markdown.value
  const start = text.lastIndexOf('\n', textarea.selectionStart - 1) + 1
  const nextBreak = text.indexOf('\n', textarea.selectionEnd)
  const end = nextBreak === -1 ? text.length : nextBreak
  return { start, end, selected: text.slice(start, end) }
}

function prefixLines(prefix) {
  const range = getLineRange()
  if (!range) return
  const next = range.selected
    .split('\n')
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
    .join('\n')
  replaceRange(range.start, range.end, next, range.start, range.start + next.length)
}

function prefixOrderedLines() {
  const range = getLineRange()
  if (!range) return
  const next = range.selected
    .split('\n')
    .map((line, index) => (/^\d+\.\s/.test(line) ? line : `${index + 1}. ${line}`))
    .join('\n')
  replaceRange(range.start, range.end, next, range.start, range.start + next.length)
}

function insertAtCursor(value) {
  const textarea = editorRef.value
  if (!textarea) return
  replaceRange(textarea.selectionStart, textarea.selectionEnd, value)
}

function insertLink() {
  const textarea = editorRef.value
  if (!textarea) return
  const { selectionStart, selectionEnd } = textarea
  const selected = markdown.value.slice(selectionStart, selectionEnd) || '链接文字'
  const next = `[${selected}](https://example.com)`
  replaceRange(selectionStart, selectionEnd, next, selectionStart + 1, selectionStart + 1 + selected.length)
}

function insertImage() {
  insertAtCursor('![图片描述](https://example.com/image.png)')
}

function insertCodeBlock() {
  insertAtCursor('\n```js\nconsole.log("PaperMD")\n```\n')
}

function insertTable() {
  insertAtCursor('\n| 列一 | 列二 |\n| --- | --- |\n| 内容 | 内容 |\n')
}

function insertMath() {
  insertAtCursor('\n$$\nE = mc^2\n$$\n')
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function importFile(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const isTextFile = /\.(md|markdown|txt)$/i.test(file.name) || /^text\//.test(file.type)
  if (!isTextFile) {
    saveStatus.value = '仅支持 .md 或 .txt 文件'
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    markdown.value = String(reader.result || '')
    saveStatus.value = `已导入 ${file.name}`
    event.target.value = ''
    focusEditor()
  }
  reader.readAsText(file)
}

function newDocument() {
  if (markdown.value.trim() && !window.confirm('清空当前内容并新建文档？当前草稿会被新的空文档覆盖。')) {
    return
  }
  markdown.value = ''
  saveStatus.value = '已新建空文档'
  focusEditor()
}

function toggleSettings() {
  isSettingsOpen.value = !isSettingsOpen.value
}

function updatePrintStyle() {
  const id = 'papermd-print-style'
  const existing = document.getElementById(id)
  existing?.remove()

  const style = document.createElement('style')
  style.id = id
  style.textContent = `
    @page {
      size: ${settings.pageSize};
      margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
    }

    @media print {
      html,
      body {
        background: #ffffff !important;
      }

      .app-shell > :not(.print-only) {
        display: none !important;
      }

      .print-only {
        display: block !important;
        box-shadow: none !important;
        border: 0 !important;
        padding: 0 !important;
        max-width: none !important;
        min-height: auto !important;
      }
    }
  `
  document.head.appendChild(style)
}

function printPdf() {
  updatePrintStyle()
  window.setTimeout(() => window.print(), 50)
}

watch(markdown, scheduleSave)
watch(settings, scheduleSave, { deep: true })
watch(
  () => saveStatus.value,
  () => {
    window.clearTimeout(statusTimer)
    if (saveStatus.value.startsWith('已导入') || saveStatus.value.startsWith('已新建')) {
      statusTimer = window.setTimeout(scheduleSave, 100)
    }
  },
)

onMounted(() => {
  saveStatus.value = '已恢复本地草稿'
  updatePrintStyle()
})

onBeforeUnmount(() => {
  window.clearTimeout(saveTimer)
  window.clearTimeout(statusTimer)
})
</script>
