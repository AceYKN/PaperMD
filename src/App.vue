<template>
  <div
    class="app-shell"
    :class="{
      'settings-open': isSettingsOpen,
      'drafts-open': isDraftsOpen,
      'theme-dark': settings.colorMode === 'dark',
    }"
  >
    <header class="topbar">
      <div class="brand" :aria-label="t('appName')">
        <FileText :size="22" stroke-width="2.2" />
        <div>
          <strong>{{ t('appName') }}</strong>
          <span><i class="status-dot" :class="saveStateDotClass" aria-hidden="true"></i>{{ saveStatus }}</span>
        </div>
      </div>

      <div class="topbar-actions">
        <label class="toolbar-select" :title="currentLanguageLabel">
          <select v-model="settings.locale" :aria-label="t('language')">
            <option v-for="option in languageOptions" :key="option.value" :value="option.value">{{ option.fullLabel }}</option>
          </select>
        </label>

        <button class="ghost-button" type="button" :title="t('saveTitle')" @click="saveNow">
          <Save :size="18" />
          <span>{{ t('save') }}</span>
        </button>
        <button class="ghost-button" type="button" :title="t('draftsTitle')" @click="toggleDrafts">
          <FolderOpen :size="18" />
          <span>{{ t('drafts') }}</span>
        </button>
        <button class="ghost-button" type="button" :title="t('newDocumentTitle')" @click="newDocument">
          <FilePlus :size="18" />
          <span>{{ t('newDocument') }}</span>
        </button>
        <button class="ghost-button" type="button" :title="t('importTitle')" @click="openFilePicker">
          <Upload :size="18" />
          <span>{{ t('import') }}</span>
        </button>
        <button class="ghost-button" type="button" :title="t('searchTitle')" @click="toggleFindPanel">
          <Search :size="18" />
          <span>{{ t('search') }}</span>
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
        <button class="ghost-button" type="button" :title="t('exportMarkdownTitle')" @click="exportMarkdown">
          <Download :size="18" />
          <span>{{ t('exportMarkdown') }}</span>
        </button>
        <button class="ghost-button" type="button" :title="t('exportHtmlTitle')" @click="exportHtml">
          <FileDown :size="18" />
          <span>{{ t('exportHtml') }}</span>
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
            <h1>{{ documentTitle }}</h1>
          </div>
          <div class="document-stats">
            <span>{{ dirtyLabel }}</span>
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

        <div v-if="findState.open" class="find-panel" :aria-label="t('searchTitle')">
          <label class="find-field">
            <Search :size="16" />
            <input ref="findInputRef" v-model="findState.query" type="search" :placeholder="t('findPlaceholder')" />
          </label>
          <span class="match-count">{{ matchSummary }}</span>
          <button class="icon-button" type="button" :title="t('findPrevious')" @click="selectPreviousMatch">↑</button>
          <button class="icon-button" type="button" :title="t('findNext')" @click="selectNextMatch">↓</button>
          <label class="find-field replace-field">
            <input v-model="findState.replacement" type="text" :placeholder="t('replacePlaceholder')" />
          </label>
          <button class="ghost-button compact-button" type="button" @click="replaceCurrentMatch">{{ t('replaceCurrent') }}</button>
          <button class="ghost-button compact-button" type="button" @click="replaceEveryMatch">{{ t('replaceAll') }}</button>
          <label class="check-field compact-check">
            <input v-model="findState.caseSensitive" type="checkbox" />
            <span>{{ t('caseSensitive') }}</span>
          </label>
          <label class="check-field compact-check">
            <input v-model="findState.regex" type="checkbox" />
            <span>{{ t('regex') }}</span>
          </label>
        </div>

        <textarea
          ref="editorRef"
          v-model="markdown"
          class="markdown-input"
          spellcheck="false"
          :aria-label="t('markdownContentAria')"
          @keydown="handleEditorKeydown"
          @scroll="handleEditorScroll"
          @drop.prevent="handleEditorDrop"
          @dragover.prevent
          @paste="handleEditorPaste"
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

        <nav v-if="headings.length" class="outline-strip" :aria-label="t('outline')">
          <button
            v-for="heading in headings"
            :key="`${heading.slug}-${heading.line}`"
            type="button"
            :class="`outline-level-${heading.level}`"
            @click="jumpToHeading(heading)"
          >
            {{ heading.title }}
          </button>
        </nav>
        <div v-else class="outline-empty">{{ t('outlineEmpty') }}</div>

        <article
          ref="previewRef"
          class="preview-document markdown-body"
          :class="[`theme-${settings.theme}`, `preset-${settings.exportPreset}`]"
          :style="previewStyle"
          @click="handlePreviewClick"
          v-html="renderedHtml"
        />
      </section>

      <button
        v-if="isSettingsOpen || isDraftsOpen"
        class="settings-backdrop"
        type="button"
        :aria-label="t('closeSettings')"
        @click="closeDrawers"
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
            <span>{{ t('exportPreset') }}</span>
            <select v-model="settings.exportPreset" @change="applyExportPreset">
              <option v-for="preset in exportPresetOptions" :key="preset.value" :value="preset.value">{{ preset.label }}</option>
            </select>
          </label>

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
                <input
                  v-model.number="settings.margins[item.key]"
                  type="number"
                  :min="MARGIN_MIN"
                  :max="MARGIN_MAX"
                  step="1"
                />
              </label>
            </div>
          </div>

          <label class="field">
            <span>{{ t('fontFamily') }}</span>
            <select v-model="settings.fontFamily">
              <option v-for="font in fontOptions" :key="font.value" :value="font.value">{{ font.label }}</option>
            </select>
          </label>

          <label class="field">
            <span>{{ t('fontSizeLabel', { value: settings.fontSize }) }}</span>
            <input v-model.number="settings.fontSize" type="range" :min="FONT_SIZE_MIN" :max="FONT_SIZE_MAX" step="1" />
          </label>

          <label class="field">
            <span>{{ t('lineHeightLabel', { value: lineHeightValue }) }}</span>
            <input
              v-model.number="settings.lineHeight"
              type="range"
              :min="LINE_HEIGHT_MIN"
              :max="LINE_HEIGHT_MAX"
              step="0.1"
            />
          </label>

          <div class="field-group">
            <span>{{ t('headerFooter') }}</span>
            <label class="check-field">
              <input v-model="settings.includeToc" type="checkbox" />
              <span>{{ t('includeToc') }}</span>
            </label>
            <label class="check-field">
              <input v-model="settings.printHeader" type="checkbox" />
              <span>{{ t('printHeader') }}</span>
            </label>
            <label class="check-field">
              <input v-model="settings.printFooter" type="checkbox" />
              <span>{{ t('printFooter') }}</span>
            </label>
            <label class="check-field">
              <input v-model="settings.printDate" type="checkbox" />
              <span>{{ t('printDate') }}</span>
            </label>
            <label class="check-field">
              <input v-model="settings.printPageNumbers" type="checkbox" />
              <span>{{ t('printPageNumbers') }}</span>
            </label>
            <label class="check-field">
              <input v-model="settings.syncScroll" type="checkbox" />
              <span>{{ t('syncScroll') }}</span>
            </label>
          </div>
        </div>

        <div class="settings-actions">
          <button class="ghost-button reset-settings" type="button" :title="t('resetDefaults')" @click="resetLayoutSettings">
            <span>{{ t('resetDefaults') }}</span>
          </button>
        </div>

        <div class="export-summary">
          <span>{{ settings.pageSize }}</span>
          <span>{{ settings.margins.top }} / {{ settings.margins.right }} / {{ settings.margins.bottom }} / {{ settings.margins.left }} mm</span>
          <span>{{ settings.fontSize }}px · {{ lineHeightValue }} · {{ fontLabel }}</span>
        </div>
      </aside>

      <aside
        class="drafts-panel"
        :aria-label="t('draftsPanelTitle')"
        :aria-hidden="!isDraftsOpen"
        :inert="!isDraftsOpen"
      >
        <div class="panel-header">
          <div>
            <span class="panel-kicker">{{ t('draftsKicker') }}</span>
            <h1>{{ t('draftsPanelTitle') }}</h1>
          </div>
          <button
            class="icon-button close-settings"
            type="button"
            :title="t('closeSettings')"
            :aria-label="t('closeSettings')"
            @click="closeDrafts"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="drafts-actions">
          <button class="ghost-button reset-settings" type="button" @click="saveNow">
            <Save :size="17" />
            <span>{{ t('saveCurrentDraft') }}</span>
          </button>
        </div>

        <div class="draft-list">
          <article
            v-for="draft in sortedDrafts"
            :key="draft.id"
            class="draft-item"
            :class="{ active: draft.id === currentDraftId }"
          >
            <button class="draft-main" type="button" :title="t('openDraft')" @click="openDraft(draft.id)">
              <strong>{{ getDraftTitle(draft) }}</strong>
              <span>{{ formatDraftDate(draft.updatedAt) }} · {{ t('draftWordCount', { count: draft.wordCount }) }}</span>
            </button>
            <div class="draft-item-actions" :aria-label="t('draftActionsAria')">
              <button class="icon-button" type="button" :title="t('renameDraft')" @click="renameCurrentDraft(draft.id)">
                <Pencil :size="16" />
              </button>
              <button class="icon-button" type="button" :title="t('duplicateDraft')" @click="duplicateCurrentDraft(draft.id)">
                <Copy :size="16" />
              </button>
              <button class="icon-button" type="button" :title="t('deleteDraft')" @click="removeDraft(draft.id)">
                <Trash2 :size="16" />
              </button>
            </div>
          </article>
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

    <section
      class="print-only"
      :class="[`theme-${settings.theme}`, `preset-${settings.exportPreset}`]"
      :style="previewStyle"
    >
      <header v-if="settings.printHeader" class="print-header">
        <span>{{ documentTitle }}</span>
        <span v-if="settings.printDate">{{ printDateLabel }}</span>
      </header>
      <nav v-if="settings.includeToc && headings.length" class="print-toc markdown-body">
        <h1>{{ t('printTocTitle') }}</h1>
        <ol>
          <li v-for="heading in headings" :key="`${heading.slug}-print`" :class="`toc-level-${heading.level}`">
            <a :href="`#${heading.slug}`">{{ heading.title }}</a>
          </li>
        </ol>
      </nav>
      <article class="markdown-body" v-html="renderedHtml" />
      <footer v-if="settings.printFooter" class="print-footer">
        <span>{{ documentTitle }}</span>
        <span v-if="settings.printPageNumbers">{{ t('printPageNumbers') }}</span>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  Bold,
  Code2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileDown,
  FilePlus,
  FileText,
  FolderOpen,
  Heading1,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Moon,
  Pencil,
  Printer,
  Quote,
  Save,
  Search,
  Sigma,
  SlidersHorizontal,
  Sun,
  Table2,
  Trash2,
  Upload,
  X,
} from '@lucide/vue'
import { DEFAULT_LOCALE, getMessage, getSampleMarkdown, isSampleMarkdown, LANGUAGE_OPTIONS, resolveLocale } from './i18n'
import {
  buildExportFileName,
  buildHtmlDocument,
  DEFAULT_DOCUMENT_TITLE,
  EXPORT_PRESETS,
  extractDocumentTitle,
  extractHeadings,
  FONT_FAMILIES,
  sanitizeFileName,
} from './document'
import {
  countCharacters,
  createDraft,
  deleteDraft,
  duplicateDraft,
  getDraftDisplayTitle,
  loadDraftState,
  normalizeDraft,
  renameDraft,
  saveDraftState,
  sortDrafts,
  upsertDraft,
} from './drafts'
import { continueMarkdownList, insertImageMarkdown, toggleTaskAtLine } from './editorActions'
import { findMatches, getNextMatchIndex, getPreviousMatchIndex, replaceAllMatches, replaceSingleMatch } from './findReplace'
import { renderMarkdown } from './markdown'

const SETTINGS_KEY = 'papermd:settings'
const PAGE_SIZES = ['A4', 'A5', 'Letter']
const THEMES = ['github', 'minimal']
const COLOR_MODES = ['light', 'dark']
const MARGIN_MIN = 0
const MARGIN_MAX = 60
const FONT_SIZE_MIN = 10
const FONT_SIZE_MAX = 22
const LINE_HEIGHT_MIN = 1.2
const LINE_HEIGHT_MAX = 2.2
const EXPORT_PRESET_KEYS = ['paper', 'report', 'resume', 'handout', 'github']
const FONT_KEYS = ['system', 'song', 'hei', 'serif', 'sans', 'mono']

const defaultSettings = {
  pageSize: 'A4',
  theme: 'github',
  exportPreset: 'github',
  margins: {
    top: 18,
    right: 16,
    bottom: 18,
    left: 16,
  },
  fontSize: 16,
  lineHeight: 1.7,
  fontFamily: 'sans',
  includeToc: false,
  printHeader: false,
  printFooter: true,
  printDate: true,
  printPageNumbers: true,
  syncScroll: true,
  colorMode: 'light',
  locale: resolveLocale(typeof navigator === 'undefined' ? DEFAULT_LOCALE : navigator.language),
}

const editorRef = ref(null)
const previewRef = ref(null)
const fileInputRef = ref(null)
const findInputRef = ref(null)
const mobileMode = ref('edit')
const isSettingsOpen = ref(false)
const isDraftsOpen = ref(false)
const settings = reactive(loadStoredSettings())
const initialDraftState = loadDraftState(localStorage, getSampleMarkdown(settings.locale))
const drafts = ref(initialDraftState.drafts)
const currentDraftId = ref(initialDraftState.currentDraftId)
const initialDraft = drafts.value.find((draft) => draft.id === currentDraftId.value) || drafts.value[0]
const markdown = ref(initialDraft?.content || getSampleMarkdown(settings.locale))
const savedSnapshot = ref(markdown.value)
const saveState = ref({ type: 'loading' })
const findState = reactive({
  open: false,
  query: '',
  replacement: '',
  caseSensitive: false,
  regex: false,
  activeIndex: -1,
})
let saveTimer = 0
let statusTimer = 0
let scrollSyncFrame = 0
let isProgrammaticMarkdownChange = false
let mermaidModulePromise = null

const pageSizes = PAGE_SIZES
const languageOptions = LANGUAGE_OPTIONS
const currentLanguageLabel = computed(
  () => languageOptions.find((o) => o.value === settings.locale)?.fullLabel || t('language'),
)
const activeDraft = computed(() => drafts.value.find((draft) => draft.id === currentDraftId.value) || null)
const sortedDrafts = computed(() => sortDrafts(drafts.value))
const documentTitle = computed(() => extractDocumentTitle(markdown.value, getDraftDisplayTitle(activeDraft.value)))
const renderedHtml = computed(() => renderMarkdown(markdown.value))
const headings = computed(() => extractHeadings(markdown.value))
const wordCount = computed(() => countCharacters(markdown.value))
const lineCount = computed(() => markdown.value.split('\n').length)
const lineHeightValue = computed(() => settings.lineHeight.toFixed(1))
const wordCountLabel = computed(() => t('wordCount', { count: wordCount.value }))
const lineCountLabel = computed(() => t('lineCount', { count: lineCount.value }))
const isDirty = computed(() => markdown.value !== savedSnapshot.value)
const dirtyLabel = computed(() => (isDirty.value ? t('unsaved') : t('savedLabel')))
const previewStyle = computed(() => ({
  '--doc-font-size': `${settings.fontSize}px`,
  '--doc-line-height': settings.lineHeight,
  '--doc-font-family': FONT_FAMILIES[settings.fontFamily] || FONT_FAMILIES.sans,
}))
const colorModeLabel = computed(() => (settings.colorMode === 'dark' ? t('lightMode') : t('darkMode')))
const colorModeTitle = computed(() => (settings.colorMode === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')))
const themeOptions = computed(() => [
  { value: 'github', label: t('themeGithub') },
  { value: 'minimal', label: t('themeMinimal') },
])
const exportPresetOptions = computed(() =>
  EXPORT_PRESET_KEYS.map((value) => ({ value, label: t(`preset${capitalize(value)}`) })),
)
const fontOptions = computed(() => FONT_KEYS.map((value) => ({ value, label: t(`font${capitalize(value)}`) })))
const fontLabel = computed(() => fontOptions.value.find((font) => font.value === settings.fontFamily)?.label || t('fontSans'))
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
const matches = computed(() =>
  findMatches(markdown.value, findState.query, {
    caseSensitive: findState.caseSensitive,
    regex: findState.regex,
  }),
)
const matchSummary = computed(() => {
  if (!findState.query) return t('findPlaceholder')
  if (!matches.value.length) return t('noMatches')

  return t('matchesSummary', {
    current: findState.activeIndex + 1,
    total: matches.value.length,
  })
})
const printDateLabel = computed(() =>
  new Intl.DateTimeFormat(settings.locale, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date()),
)
const saveStatus = computed(() => {
  switch (saveState.value.type) {
    case 'restored':
      return t('statusRestored')
    case 'saving':
      return t('statusSaving')
    case 'saved':
      return t('statusSaved', { time: formatStatusTime(saveState.value.time) })
    case 'manual-saved':
      return t('statusManualSaved', { time: formatStatusTime(saveState.value.time) })
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

const saveStateDotClass = computed(() => {
  switch (saveState.value.type) {
    case 'saving': return 'dot-saving'
    case 'saved':
    case 'manual-saved':
    case 'restored':
    case 'imported':
    case 'new': return 'dot-saved'
    case 'unavailable':
    case 'message': return 'dot-error'
    default: return 'dot-idle'
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

function sanitizeExportPreset(value) {
  return EXPORT_PRESET_KEYS.includes(value) ? value : defaultSettings.exportPreset
}

function sanitizeFontFamily(value) {
  return FONT_KEYS.includes(value) ? value : defaultSettings.fontFamily
}

function loadStoredSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      ...defaultSettings,
      ...saved,
      pageSize: sanitizePageSize(saved.pageSize),
      theme: sanitizeTheme(saved.theme),
      exportPreset: sanitizeExportPreset(saved.exportPreset),
      colorMode: sanitizeColorMode(saved.colorMode),
      fontFamily: sanitizeFontFamily(saved.fontFamily),
      locale: resolveLocale(saved.locale || defaultSettings.locale),
      fontSize: clampNumber(saved.fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX, defaultSettings.fontSize),
      lineHeight: clampNumber(saved.lineHeight, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX, defaultSettings.lineHeight),
      includeToc: Boolean(saved.includeToc ?? defaultSettings.includeToc),
      printHeader: Boolean(saved.printHeader ?? defaultSettings.printHeader),
      printFooter: Boolean(saved.printFooter ?? defaultSettings.printFooter),
      printDate: Boolean(saved.printDate ?? defaultSettings.printDate),
      printPageNumbers: Boolean(saved.printPageNumbers ?? defaultSettings.printPageNumbers),
      syncScroll: Boolean(saved.syncScroll ?? defaultSettings.syncScroll),
      margins: {
        top: clampNumber(saved.margins?.top, MARGIN_MIN, MARGIN_MAX, defaultSettings.margins.top),
        right: clampNumber(saved.margins?.right, MARGIN_MIN, MARGIN_MAX, defaultSettings.margins.right),
        bottom: clampNumber(saved.margins?.bottom, MARGIN_MIN, MARGIN_MAX, defaultSettings.margins.bottom),
        left: clampNumber(saved.margins?.left, MARGIN_MIN, MARGIN_MAX, defaultSettings.margins.left),
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
  if (isProgrammaticMarkdownChange) return

  saveState.value = { type: 'saving' }
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => persistCurrentDraft(), 500)
}

function persistCurrentDraft({ manual = false } = {}) {
  try {
    const now = new Date().toISOString()
    const current = activeDraft.value
    const title = current?.manualTitle
      ? current.title
      : extractDocumentTitle(markdown.value, current?.title || DEFAULT_DOCUMENT_TITLE)
    const draft = normalizeDraft({
      ...current,
      id: current?.id || currentDraftId.value,
      title,
      manualTitle: Boolean(current?.manualTitle),
      content: markdown.value,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    })

    drafts.value = upsertDraft(drafts.value, draft)
    currentDraftId.value = draft.id
    saveDraftState(localStorage, drafts.value, currentDraftId.value)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    savedSnapshot.value = markdown.value
    saveState.value = { type: manual ? 'manual-saved' : 'saved', time: new Date() }
  } catch {
    saveState.value = { type: 'unavailable' }
  }
}

function saveNow() {
  window.clearTimeout(saveTimer)
  persistCurrentDraft({ manual: true })
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

  if (!confirmIfUnsaved()) {
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const content = String(reader.result || '')
    const detectedTitle = extractDocumentTitle(content, '')
    const fallbackTitle = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''), DEFAULT_DOCUMENT_TITLE)
    const draft = createDraft({ content, title: detectedTitle || fallbackTitle })
    draft.manualTitle = !detectedTitle

    drafts.value = upsertDraft(drafts.value, draft)
    switchToDraft(draft.id, { closePanel: false })
    saveDraftState(localStorage, drafts.value, draft.id)
    saveState.value = { type: 'imported', name: file.name }
    event.target.value = ''
    focusEditor()
  }
  reader.readAsText(file)
}

function newDocument() {
  if (!confirmIfUnsaved()) return

  const draft = createDraft({ content: '' })
  drafts.value = upsertDraft(drafts.value, draft)
  switchToDraft(draft.id, { closePanel: false })
  saveDraftState(localStorage, drafts.value, draft.id)
  saveState.value = { type: 'new' }
  focusEditor()
}

function confirmIfUnsaved() {
  if (!isDirty.value) return true

  return window.confirm(t('confirmUnsaved'))
}

function toggleSettings() {
  isSettingsOpen.value = !isSettingsOpen.value
  if (isSettingsOpen.value) isDraftsOpen.value = false
}

function closeSettings() {
  isSettingsOpen.value = false
}

function toggleDrafts() {
  isDraftsOpen.value = !isDraftsOpen.value
  if (isDraftsOpen.value) isSettingsOpen.value = false
}

function closeDrafts() {
  isDraftsOpen.value = false
}

function closeDrawers() {
  closeSettings()
  closeDrafts()
}

function toggleColorMode() {
  settings.colorMode = settings.colorMode === 'dark' ? 'light' : 'dark'
}

function resetLayoutSettings() {
  settings.pageSize = defaultSettings.pageSize
  settings.exportPreset = defaultSettings.exportPreset
  settings.theme = defaultSettings.theme
  settings.fontSize = defaultSettings.fontSize
  settings.lineHeight = defaultSettings.lineHeight
  settings.fontFamily = defaultSettings.fontFamily
  settings.includeToc = defaultSettings.includeToc
  settings.printHeader = defaultSettings.printHeader
  settings.printFooter = defaultSettings.printFooter
  settings.printDate = defaultSettings.printDate
  settings.printPageNumbers = defaultSettings.printPageNumbers
  settings.syncScroll = defaultSettings.syncScroll
  Object.assign(settings.margins, defaultSettings.margins)
}

function applyExportPreset() {
  const preset = EXPORT_PRESETS[settings.exportPreset]
  if (!preset) return

  settings.pageSize = preset.pageSize
  settings.theme = preset.theme
  settings.fontSize = preset.fontSize
  settings.lineHeight = preset.lineHeight
  settings.fontFamily = preset.fontFamily
  Object.assign(settings.margins, preset.margins)
}

function openDraft(id) {
  if (!confirmIfUnsaved()) return

  switchToDraft(id)
  focusEditor()
}

function switchToDraft(id, { closePanel = true } = {}) {
  const draft = drafts.value.find((item) => item.id === id)
  if (!draft) return

  isProgrammaticMarkdownChange = true
  currentDraftId.value = draft.id
  markdown.value = draft.content
  savedSnapshot.value = draft.content
  saveState.value = { type: 'restored' }
  nextTick(() => {
    isProgrammaticMarkdownChange = false
  })

  try {
    saveDraftState(localStorage, drafts.value, draft.id)
  } catch {
    saveState.value = { type: 'unavailable' }
  }

  if (closePanel) closeDrafts()
}

function getDraftTitle(draft) {
  return getDraftDisplayTitle(draft)
}

function formatDraftDate(value) {
  try {
    return new Intl.DateTimeFormat(settings.locale, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

function renameCurrentDraft(id) {
  const draft = drafts.value.find((item) => item.id === id)
  const nextTitle = window.prompt(t('promptRenameDraft'), getDraftDisplayTitle(draft))
  if (nextTitle === null) return

  drafts.value = renameDraft(drafts.value, id, nextTitle)
  saveDraftState(localStorage, drafts.value, currentDraftId.value)
  saveState.value = { type: 'message', message: t('statusDraftRenamed') }
}

function duplicateCurrentDraft(id) {
  drafts.value = duplicateDraft(drafts.value, id, { copySuffix: t('copySuffix') })
  const newest = sortDrafts(drafts.value)[0]
  if (newest) {
    switchToDraft(newest.id, { closePanel: false })
  }
  saveDraftState(localStorage, drafts.value, currentDraftId.value)
  saveState.value = { type: 'message', message: t('statusDraftDuplicated') }
}

function removeDraft(id) {
  const draft = drafts.value.find((item) => item.id === id)
  if (!window.confirm(t('confirmDeleteDraft', { title: getDraftDisplayTitle(draft) }))) return

  const nextDrafts = deleteDraft(drafts.value, id)
  drafts.value = nextDrafts.length ? nextDrafts : [createDraft({ content: '' })]
  const nextActive = id === currentDraftId.value ? sortDrafts(drafts.value)[0] : activeDraft.value
  if (nextActive) {
    switchToDraft(nextActive.id, { closePanel: false })
  }
  saveDraftState(localStorage, drafts.value, currentDraftId.value)
  saveState.value = { type: 'message', message: t('statusDraftDeleted') }
}

function updatePrintStyle() {
  const id = 'papermd-print-style'
  const existing = document.getElementById(id)
  existing?.remove()

  const title = escapeCssContent(documentTitle.value)
  const date = escapeCssContent(printDateLabel.value)
  const footerContent = settings.printPageNumbers
    ? `"${escapeCssContent(t('printPageLabel'))} " counter(page)`
    : `"${title}"`
  const style = document.createElement('style')
  style.id = id
  style.textContent = `
    @page {
      size: ${settings.pageSize};
      margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
      ${settings.printHeader ? `@top-center { content: "${title}${settings.printDate ? ` · ${date}` : ''}"; }` : ''}
      ${settings.printFooter ? `@bottom-center { content: ${footerContent}; }` : ''}
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

      .print-header,
      .print-footer {
        display: flex !important;
      }
    }
  `
  document.head.appendChild(style)
}

async function printPdf() {
  saveNow()
  closeDrawers()
  updatePrintStyle()
  await renderMermaidDiagrams()
  window.setTimeout(() => window.print(), 50)
}

function exportMarkdown() {
  saveNow()
  downloadBlob(markdown.value, buildExportFileName(markdown.value, 'md', documentTitle.value), 'text/markdown;charset=utf-8')
  saveState.value = { type: 'message', message: t('statusExported', { type: 'Markdown' }) }
}

function exportHtml() {
  saveNow()
  const html = buildHtmlDocument({
    title: documentTitle.value,
    bodyHtml: renderedHtml.value,
    settings,
    includeToc: settings.includeToc,
    headings: headings.value,
  })
  downloadBlob(html, buildExportFileName(markdown.value, 'html', documentTitle.value), 'text/html;charset=utf-8')
  saveState.value = { type: 'message', message: t('statusExported', { type: 'HTML' }) }
}

function downloadBlob(content, fileName, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function toggleFindPanel() {
  findState.open = !findState.open
  if (findState.open) {
    nextTick(() => findInputRef.value?.focus())
  }
}

function selectNextMatch() {
  selectMatch(getNextMatchIndex(matches.value, findState.activeIndex))
}

function selectPreviousMatch() {
  selectMatch(getPreviousMatchIndex(matches.value, findState.activeIndex))
}

function selectMatch(index) {
  const match = matches.value[index]
  if (!match) return

  findState.activeIndex = index
  nextTick(() => {
    const textarea = editorRef.value
    if (!textarea) return

    const maxScroll = Math.max(0, textarea.scrollHeight - textarea.clientHeight)
    textarea.focus({ preventScroll: true })
    textarea.setSelectionRange(match.index, match.index + match.length)
    textarea.scrollTop = markdown.value.length ? (match.index / markdown.value.length) * maxScroll : 0
  })
}

function replaceCurrentMatch() {
  const match = matches.value[findState.activeIndex] || matches.value[0]
  if (!match) {
    saveState.value = { type: 'message', message: t('statusNoMatches') }
    return
  }

  markdown.value = replaceSingleMatch(markdown.value, match, findState.replacement)
  nextTick(() => {
    const nextIndex = Math.min(findState.activeIndex, matches.value.length - 1)
    selectMatch(nextIndex)
  })
}

function replaceEveryMatch() {
  const result = replaceAllMatches(markdown.value, findState.query, findState.replacement, {
    caseSensitive: findState.caseSensitive,
    regex: findState.regex,
  })

  markdown.value = result.text
  findState.activeIndex = -1
  saveState.value = {
    type: 'message',
    message: result.count ? t('statusReplaced', { count: result.count }) : t('statusNoMatches'),
  }
}

function handleEditorKeydown(event) {
  if (event.key !== 'Enter') return

  const textarea = editorRef.value
  if (!textarea) return

  const result = continueMarkdownList(markdown.value, textarea.selectionStart, textarea.selectionEnd)
  if (!result) return

  event.preventDefault()
  markdown.value = result.text
  nextTick(() => {
    textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
  })
}

function handleWindowKeydown(event) {
  const key = event.key.toLowerCase()
  const isShortcut = event.ctrlKey || event.metaKey
  const targetTag = event.target?.tagName

  if (event.key === 'Escape') {
    if (isSettingsOpen.value || isDraftsOpen.value) {
      closeDrawers()
      return
    }
    if (findState.open) {
      findState.open = false
      return
    }
  }

  if (!isShortcut) return
  if ((targetTag === 'INPUT' || targetTag === 'SELECT') && key !== 's' && key !== 'p') return

  if (key === 'b') {
    event.preventDefault()
    wrapSelection('**', '**', t('placeholderBold'))
  } else if (key === 'i') {
    event.preventDefault()
    wrapSelection('*', '*', t('placeholderItalic'))
  } else if (key === 'k') {
    event.preventDefault()
    insertLink()
  } else if (key === 's') {
    event.preventDefault()
    saveNow()
  } else if (key === 'p') {
    event.preventDefault()
    printPdf()
  } else if (key === 'f') {
    event.preventDefault()
    findState.open = true
    nextTick(() => findInputRef.value?.focus())
  }
}

function handleBeforeUnload(event) {
  if (!isDirty.value) return

  event.preventDefault()
  event.returnValue = t('confirmUnsaved')
}

function handleEditorScroll() {
  if (!settings.syncScroll || !previewRef.value || !editorRef.value) return

  window.cancelAnimationFrame(scrollSyncFrame)
  scrollSyncFrame = window.requestAnimationFrame(() => {
    const editor = editorRef.value
    const preview = previewRef.value
    const editorMax = Math.max(1, editor.scrollHeight - editor.clientHeight)
    const previewMax = Math.max(0, preview.scrollHeight - preview.clientHeight)
    const ratio = editor.scrollTop / editorMax
    preview.scrollTop = ratio * previewMax
  })
}

function jumpToHeading(heading) {
  const textarea = editorRef.value
  const preview = previewRef.value
  const target = preview?.querySelector(`#${CSS.escape(heading.slug)}`)

  target?.scrollIntoView({ block: 'start', behavior: 'smooth' })

  if (textarea) {
    const lines = markdown.value.split('\n')
    const index = lines.slice(0, heading.line).join('\n').length + (heading.line > 0 ? 1 : 0)
    textarea.focus({ preventScroll: true })
    textarea.setSelectionRange(index, index)
    textarea.scrollTop = (heading.line / Math.max(1, lines.length - 1)) * Math.max(0, textarea.scrollHeight - textarea.clientHeight)
  }
}

function handlePreviewClick(event) {
  const checkbox = event.target.closest?.('.task-list-checkbox')
  if (!checkbox) return

  event.preventDefault()
  const line = Number(checkbox.dataset.taskLine)
  if (!Number.isInteger(line)) return

  markdown.value = toggleTaskAtLine(markdown.value, line)
}

async function handleEditorDrop(event) {
  const files = Array.from(event.dataTransfer?.files || []).filter((file) => file.type.startsWith('image/'))
  if (!files.length) return

  for (const file of files) {
    await insertImageFile(file)
  }
}

async function handleEditorPaste(event) {
  const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith('image/'))
  if (!files.length) return

  event.preventDefault()
  for (const file of files) {
    await insertImageFile(file)
  }
}

async function insertImageFile(file) {
  const textarea = editorRef.value
  if (!textarea) return

  const dataUrl = await readFileAsDataUrl(file)
  const result = insertImageMarkdown(markdown.value, textarea.selectionStart, textarea.selectionEnd, file.name, dataUrl)
  markdown.value = result.text
  await nextTick()
  textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
  textarea.focus({ preventScroll: true })
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function renderMermaidDiagrams() {
  await nextTick()
  const nodes = Array.from(document.querySelectorAll('.mermaid'))
  if (!nodes.length) return

  try {
    const { default: mermaid } = await (mermaidModulePromise ||= import('mermaid'))
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: settings.colorMode === 'dark' ? 'dark' : 'default',
    })
    nodes.forEach((node) => node.removeAttribute('data-processed'))
    await mermaid.run({ nodes })
  } catch {
    saveState.value = { type: 'message', message: t('mermaidRenderFailed') }
  }
}

watch(markdown, scheduleSave)
watch(settings, scheduleSave, { deep: true })
watch(
  matches,
  () => {
    findState.activeIndex = matches.value.length ? Math.min(Math.max(findState.activeIndex, 0), matches.value.length - 1) : -1
  },
  { deep: true },
)
watch(
  renderedHtml,
  () => {
    renderMermaidDiagrams()
  },
  { flush: 'post' },
)
watch(
  () => saveState.value.type,
  (type) => {
    window.clearTimeout(statusTimer)
    if (type === 'imported' || type === 'new') {
      statusTimer = window.setTimeout(() => persistCurrentDraft(), 100)
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
  () => [
    settings.pageSize,
    settings.margins.top,
    settings.margins.right,
    settings.margins.bottom,
    settings.margins.left,
    settings.printHeader,
    settings.printFooter,
    settings.printDate,
    settings.printPageNumbers,
    documentTitle.value,
  ],
  () => {
    updatePrintStyle()
  },
)

onMounted(() => {
  saveState.value = { type: 'restored' }
  updatePrintStyle()
  renderMermaidDiagrams()
  window.addEventListener('keydown', handleWindowKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.clearTimeout(saveTimer)
  window.clearTimeout(statusTimer)
  window.cancelAnimationFrame(scrollSyncFrame)
  window.removeEventListener('keydown', handleWindowKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function escapeCssContent(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')
}
</script>
