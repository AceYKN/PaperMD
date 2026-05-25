<template>
  <div class="app-shell" :class="{ 'settings-open': isSettingsOpen, 'theme-dark': settings.colorMode === 'dark' }">
    <header class="topbar">
      <div class="brand" :aria-label="t('appName')">
        <FileText :size="22" stroke-width="2.2" />
        <div>
          <strong>{{ t('appName') }}</strong>
          <span>{{ saveStatus }}</span>
        </div>
      </div>

      <div class="topbar-actions">
        <label class="toolbar-select language-switch">
          <span>{{ t('language') }}</span>
          <select v-model="settings.locale" :aria-label="t('language')">
            <option v-for="option in languageOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <button class="ghost-button" type="button" :title="t('newDocumentTitle')" @click="newDocument">
          <FilePlus :size="18" />
          <span>{{ t('newDocument') }}</span>
        </button>
        <button class="ghost-button" type="button" :title="t('importTitle')" @click="openFilePicker">
          <Upload :size="18" />
          <span>{{ t('import') }}</span>
        </button>
        <button
          class="ghost-button settings-toggle"
          type="button"
          :title="t('openSettings')"
          :aria-expanded="isSettingsOpen"
          @click="toggleSettings"
        >
          <SlidersHorizontal :size="18" />
          <span>{{ t('typesetting') }}</span>
        </button>
        <button class="ghost-button" type="button" :title="colorModeTitle" @click="toggleColorMode">
          <component :is="settings.colorMode === 'dark' ? Sun : Moon" :size="18" />
          <span>{{ colorModeLabel }}</span>
        </button>
        <button class="primary-button" type="button" :title="t('exportPdfTitle')" @click="printPdf">
          <Printer :size="18" />
          <span>{{ t('exportPdf') }}</span>
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
      <section class="editor-panel" :class="{ 'mobile-hidden': mobileMode !== 'edit' }" :aria-label="t('editorAria')">
        <div class="panel-header">
          <div>
            <span class="panel-kicker">{{ t('editorKicker') }}</span>
            <h1>{{ t('editorTitle') }}</h1>
          </div>
          <div class="document-stats">
            <span>{{ wordCountLabel }}</span>
            <span>{{ lineCountLabel }}</span>
          </div>
        </div>

        <div class="shortcut-toolbar" :aria-label="t('toolbarAria')">
          <button
            v-for="tool in toolbarTools"
            :key="tool.key"
            type="button"
            :title="tool.title"
            @mousedown.prevent
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
          :aria-label="t('markdownContentAria')"
        />
      </section>

      <section class="preview-panel" :class="{ 'mobile-hidden': mobileMode !== 'preview' }" :aria-label="t('previewAria')">
        <div class="panel-header preview-header">
          <div>
            <span class="panel-kicker">{{ t('previewKicker') }}</span>
            <h1>{{ t('previewTitle') }}</h1>
          </div>
          <label class="theme-switch">
            <span>{{ t('theme') }}</span>
            <select v-model="settings.theme" :aria-label="t('previewThemeAria')">
              <option v-for="theme in themeOptions" :key="theme.value" :value="theme.value">{{ theme.label }}</option>
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

      <button
        v-if="isSettingsOpen"
        class="settings-backdrop"
        type="button"
        :aria-label="t('closeSettings')"
        @click="closeSettings"
      />

      <aside
        class="settings-panel"
        :aria-label="t('settingsAria')"
        :aria-hidden="!isSettingsOpen"
        :inert="!isSettingsOpen"
      >
        <div class="panel-header">
          <div>
            <span class="panel-kicker">{{ t('exportKicker') }}</span>
            <h1>{{ t('settingsTitle') }}</h1>
          </div>
          <button
            class="icon-button close-settings"
            type="button"
            :title="t('closeSettings')"
            :aria-label="t('closeSettings')"
            @click="closeSettings"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="settings-list">
          <label class="field">
            <span>{{ t('pageSize') }}</span>
            <select v-model="settings.pageSize">
              <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
            </select>
          </label>

          <div class="field-group">
            <span>{{ t('marginsMm') }}</span>
            <div class="margin-grid">
              <label v-for="item in marginFields" :key="item.key" class="mini-field">
                <span>{{ item.label }}</span>
                <input v-model.number="settings.margins[item.key]" type="number" min="0" max="60" step="1" />
              </label>
            </div>
          </div>

          <label class="field">
            <span>{{ t('fontSizeLabel', { value: settings.fontSize }) }}</span>
            <input v-model.number="settings.fontSize" type="range" min="12" max="22" step="1" />
          </label>

          <label class="field">
            <span>{{ t('lineHeightLabel', { value: lineHeightValue }) }}</span>
            <input v-model.number="settings.lineHeight" type="range" min="1.2" max="2.2" step="0.1" />
          </label>
        </div>

        <div class="export-summary">
          <span>{{ settings.pageSize }}</span>
          <span>{{ settings.margins.top }} / {{ settings.margins.right }} / {{ settings.margins.bottom }} / {{ settings.margins.left }} mm</span>
          <span>{{ settings.fontSize }}px · {{ lineHeightValue }}</span>
        </div>
      </aside>
    </main>

    <nav class="mobile-tabs" :aria-label="t('mobileTabsAria')">
      <button type="button" :class="{ active: mobileMode === 'edit' }" @click="mobileMode = 'edit'">
        <Edit3 :size="18" />
        <span>{{ t('editTab') }}</span>
      </button>
      <button type="button" :class="{ active: mobileMode === 'preview' }" @click="mobileMode = 'preview'">
        <Eye :size="18" />
        <span>{{ t('previewTab') }}</span>
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
  Moon,
  Printer,
  Quote,
  Sigma,
  SlidersHorizontal,
  Sun,
  Table2,
  Upload,
  X,
} from '@lucide/vue'
import { DEFAULT_LOCALE, getMessage, getSampleMarkdown, isSampleMarkdown, LANGUAGE_OPTIONS, resolveLocale } from './i18n'
import { renderMarkdown } from './markdown'

const STORAGE_KEY = 'papermd:last-document'
const SETTINGS_KEY = 'papermd:settings'
const PAGE_SIZES = ['A4', 'A5', 'Letter']
const THEMES = ['github', 'minimal']
const COLOR_MODES = ['light', 'dark']

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
  colorMode: 'light',
  locale: resolveLocale(typeof navigator === 'undefined' ? DEFAULT_LOCALE : navigator.language),
}

const editorRef = ref(null)
const fileInputRef = ref(null)
const mobileMode = ref('edit')
const isSettingsOpen = ref(false)
const settings = reactive(loadStoredSettings())
const markdown = ref(loadStoredMarkdown(settings.locale))
const saveState = ref({ type: 'loading' })
let saveTimer = 0
let statusTimer = 0

const pageSizes = PAGE_SIZES
const languageOptions = LANGUAGE_OPTIONS

const renderedHtml = computed(() => renderMarkdown(markdown.value))
const wordCount = computed(() => markdown.value.replace(/\s/g, '').length)
const lineCount = computed(() => markdown.value.split('\n').length)
const lineHeightValue = computed(() => settings.lineHeight.toFixed(1))
const wordCountLabel = computed(() => t('wordCount', { count: wordCount.value }))
const lineCountLabel = computed(() => t('lineCount', { count: lineCount.value }))
const previewStyle = computed(() => ({
  '--doc-font-size': `${settings.fontSize}px`,
  '--doc-line-height': settings.lineHeight,
}))
const colorModeLabel = computed(() => (settings.colorMode === 'dark' ? t('lightMode') : t('darkMode')))
const colorModeTitle = computed(() => (settings.colorMode === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')))
const themeOptions = computed(() => [
  { value: 'github', label: t('themeGithub') },
  { value: 'minimal', label: t('themeMinimal') },
])
const marginFields = computed(() => [
  { key: 'top', label: t('marginTop') },
  { key: 'right', label: t('marginRight') },
  { key: 'bottom', label: t('marginBottom') },
  { key: 'left', label: t('marginLeft') },
])
const toolbarTools = computed(() => [
  { key: 'heading', label: t('toolHeadingShort'), title: t('toolHeading'), icon: Heading1, action: () => prefixLines('# ') },
  { key: 'bold', label: t('toolBoldShort'), title: t('toolBold'), icon: Bold, action: () => wrapSelection('**', '**', t('placeholderBold')) },
  { key: 'italic', label: t('toolItalicShort'), title: t('toolItalic'), icon: Italic, action: () => wrapSelection('*', '*', t('placeholderItalic')) },
  { key: 'link', label: t('toolLinkShort'), title: t('toolLink'), icon: Link, action: insertLink },
  { key: 'inline-code', label: t('toolInlineCodeShort'), title: t('toolInlineCode'), icon: Code2, action: () => wrapSelection('`', '`', 'code') },
  { key: 'code-block', label: t('toolCodeBlockShort'), title: t('toolCodeBlock'), icon: Code2, action: insertCodeBlock },
  { key: 'quote', label: t('toolQuoteShort'), title: t('toolQuote'), icon: Quote, action: () => prefixLines('> ') },
  { key: 'list', label: t('toolListShort'), title: t('toolList'), icon: List, action: () => prefixLines('- ') },
  { key: 'ordered-list', label: t('toolOrderedShort'), title: t('toolOrdered'), icon: ListOrdered, action: () => prefixOrderedLines() },
  { key: 'table', label: t('toolTableShort'), title: t('toolTable'), icon: Table2, action: insertTable },
  { key: 'image', label: t('toolImageShort'), title: t('toolImage'), icon: Image, action: insertImage },
  { key: 'math', label: t('toolMathShort'), title: t('toolMath'), icon: Sigma, action: insertMath },
  { key: 'hr', label: t('toolHrShort'), title: t('toolHr'), icon: Minus, action: () => insertAtCursor('\n\n---\n\n') },
])
const saveStatus = computed(() => {
  switch (saveState.value.type) {
    case 'restored':
      return t('statusRestored')
    case 'saving':
      return t('statusSaving')
    case 'saved':
      return t('statusSaved', { time: formatStatusTime(saveState.value.time) })
    case 'imported':
      return t('statusImported', { name: saveState.value.name })
    case 'new':
      return t('statusNew')
    case 'message':
      return saveState.value.message
    case 'unavailable':
      return t('statusUnavailable')
    default:
      return t('statusLoading')
  }
})

function t(key, params = {}) {
  return getMessage(settings.locale, key, params)
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return fallback
  }

  return Math.min(max, Math.max(min, number))
}

function sanitizeTheme(value) {
  return THEMES.includes(value) ? value : defaultSettings.theme
}

function sanitizeColorMode(value) {
  return COLOR_MODES.includes(value) ? value : defaultSettings.colorMode
}

function sanitizePageSize(value) {
  return PAGE_SIZES.includes(value) ? value : defaultSettings.pageSize
}

function loadStoredMarkdown(locale) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved !== null ? saved : getSampleMarkdown(locale)
  } catch {
    return getSampleMarkdown(locale)
  }
}

function loadStoredSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      ...defaultSettings,
      ...saved,
      pageSize: sanitizePageSize(saved.pageSize),
      theme: sanitizeTheme(saved.theme),
      colorMode: sanitizeColorMode(saved.colorMode),
      locale: resolveLocale(saved.locale || defaultSettings.locale),
      fontSize: clampNumber(saved.fontSize, 12, 22, defaultSettings.fontSize),
      lineHeight: clampNumber(saved.lineHeight, 1.2, 2.2, defaultSettings.lineHeight),
      margins: {
        top: clampNumber(saved.margins?.top, 0, 60, defaultSettings.margins.top),
        right: clampNumber(saved.margins?.right, 0, 60, defaultSettings.margins.right),
        bottom: clampNumber(saved.margins?.bottom, 0, 60, defaultSettings.margins.bottom),
        left: clampNumber(saved.margins?.left, 0, 60, defaultSettings.margins.left),
      },
    }
  } catch {
    return {
      ...defaultSettings,
      margins: { ...defaultSettings.margins },
    }
  }
}

function formatStatusTime(date) {
  return new Intl.DateTimeFormat(settings.locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function scheduleSave() {
  saveState.value = { type: 'saving' }
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, markdown.value)
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      saveState.value = { type: 'saved', time: new Date() }
    } catch {
      saveState.value = { type: 'unavailable' }
    }
  }, 500)
}

function focusEditor() {
  nextTick(() => {
    editorRef.value?.focus({ preventScroll: true })
  })
}

function replaceRange(start, end, value, nextStart = start + value.length, nextEnd = nextStart) {
  const textarea = editorRef.value
  const editorScrollTop = textarea?.scrollTop || 0
  const pageScrollX = window.scrollX
  const pageScrollY = window.scrollY
  const text = markdown.value
  markdown.value = `${text.slice(0, start)}${value}${text.slice(end)}`
  nextTick(() => {
    const currentTextarea = editorRef.value
    if (!currentTextarea) return
    currentTextarea.focus({ preventScroll: true })
    currentTextarea.setSelectionRange(nextStart, nextEnd)
    currentTextarea.scrollTop = editorScrollTop
    window.scrollTo(pageScrollX, pageScrollY)
    window.requestAnimationFrame(() => {
      currentTextarea.scrollTop = editorScrollTop
      window.scrollTo(pageScrollX, pageScrollY)
    })
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
  const selected = markdown.value.slice(selectionStart, selectionEnd) || t('placeholderLinkText')
  const next = `[${selected}](https://example.com)`
  replaceRange(selectionStart, selectionEnd, next, selectionStart + 1, selectionStart + 1 + selected.length)
}

function insertImage() {
  insertAtCursor(`![${t('imageAltPlaceholder')}](https://example.com/image.png)`)
}

function insertCodeBlock() {
  insertAtCursor('\n```js\nconsole.log("PaperMD")\n```\n')
}

function insertTable() {
  insertAtCursor(`\n| ${t('tableColumnOne')} | ${t('tableColumnTwo')} |\n| --- | --- |\n| ${t('tableCell')} | ${t('tableCell')} |\n`)
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
    saveState.value = { type: 'message', message: t('unsupportedFile') }
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    markdown.value = String(reader.result || '')
    saveState.value = { type: 'imported', name: file.name }
    event.target.value = ''
    focusEditor()
  }
  reader.readAsText(file)
}

function newDocument() {
  if (markdown.value.trim() && !window.confirm(t('confirmNewDocument'))) {
    return
  }
  markdown.value = ''
  saveState.value = { type: 'new' }
  focusEditor()
}

function toggleSettings() {
  isSettingsOpen.value = !isSettingsOpen.value
}

function closeSettings() {
  isSettingsOpen.value = false
}

function toggleColorMode() {
  settings.colorMode = settings.colorMode === 'dark' ? 'light' : 'dark'
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
      html {
        color-scheme: light !important;
      }

      html,
      body,
      #app,
      .app-shell {
        background: #ffffff !important;
      }

      .app-shell {
        min-height: auto !important;
        padding: 0 !important;
      }

      .app-shell > :not(.print-only) {
        display: none !important;
      }

      .print-only {
        display: block !important;
        color: #1f2933 !important;
        background: #ffffff !important;
        box-shadow: none !important;
        border: 0 !important;
        padding: 0 !important;
        max-width: none !important;
        min-height: auto !important;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  `
  document.head.appendChild(style)
}

function printPdf() {
  closeSettings()
  updatePrintStyle()
  window.setTimeout(() => window.print(), 50)
}

function handleWindowKeydown(event) {
  if (event.key === 'Escape' && isSettingsOpen.value) {
    closeSettings()
  }
}

watch(markdown, scheduleSave)
watch(settings, scheduleSave, { deep: true })
watch(
  () => saveState.value.type,
  (type) => {
    window.clearTimeout(statusTimer)
    if (type === 'imported' || type === 'new') {
      statusTimer = window.setTimeout(scheduleSave, 100)
    }
  },
)
watch(
  () => settings.locale,
  (locale) => {
    document.documentElement.lang = resolveLocale(locale)
    document.title = t('appName')
    if (isSampleMarkdown(markdown.value)) {
      markdown.value = getSampleMarkdown(locale)
    }
  },
  { immediate: true },
)
watch(
  () => [settings.pageSize, settings.margins.top, settings.margins.right, settings.margins.bottom, settings.margins.left],
  () => {
    updatePrintStyle()
  },
)

onMounted(() => {
  saveState.value = { type: 'restored' }
  updatePrintStyle()
  window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
  window.clearTimeout(saveTimer)
  window.clearTimeout(statusTimer)
  window.removeEventListener('keydown', handleWindowKeydown)
})
</script>