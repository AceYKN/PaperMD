export const DEFAULT_LOCALE = 'zh-CN'

export const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简', fullLabel: '简体中文' },
  { value: 'zh-TW', label: '繁', fullLabel: '繁體中文' },
  { value: 'ja', label: '日', fullLabel: '日本語' },
  { value: 'en', label: '英', fullLabel: 'English' },
]

const messages = {
  'zh-CN': {
    appName: 'PaperMD',
    statusLoading: '正在读取本地草稿',
    statusRestored: '已恢复本地草稿',
    statusSaving: '正在自动保存',
    statusSaved: ({ time }) => `已自动保存 ${time}`,
    statusUnavailable: '本地保存不可用',
    statusImported: ({ name }) => `已导入 ${name}`,
    statusNew: '已新建空文档',
    newDocument: '新建',
    newDocumentTitle: '新建文档',
    import: '导入',
    importTitle: '导入 Markdown 或文本文件',
    typesetting: '排版',
    openSettings: '打开排版设置',
    lightMode: '日间',
    darkMode: '夜间',
    switchToLightMode: '切换到日间模式',
    switchToDarkMode: '切换到夜间模式',
    exportPdf: '导出 PDF',
    exportPdfTitle: '导出 PDF',
    language: '语言',
    editorKicker: 'Markdown',
    editorTitle: '编辑',
    editorAria: 'Markdown 编辑器',
    previewKicker: 'Preview',
    previewTitle: '实时预览',
    previewAria: '实时预览',
    wordCount: ({ count }) => `${count} 字`,
    lineCount: ({ count }) => `${count} 行`,
    toolbarAria: 'Markdown 快捷工具栏',
    markdownContentAria: 'Markdown 内容',
    theme: '主题',
    previewThemeAria: '预览主题',
    themeGithub: 'GitHub',
    themeMinimal: '简约',
    settingsAria: 'PDF 排版设置',
    exportKicker: 'Export',
    settingsTitle: 'PDF 排版',
    closeSettings: '关闭设置',
    resetDefaults: '恢复默认参数',
    pageSize: '页面大小',
    marginsMm: '页边距 mm',
    marginTop: '上',
    marginRight: '右',
    marginBottom: '下',
    marginLeft: '左',
    fontSizeLabel: ({ value }) => `正文字号 ${value}px`,
    lineHeightLabel: ({ value }) => `行距 ${value}`,
    mobileTabsAria: '移动端模式切换',
    editTab: '编辑',
    previewTab: '预览',
    toolHeadingShort: 'H1',
    toolHeading: '一级标题',
    toolBoldShort: 'B',
    toolBold: '加粗',
    toolItalicShort: 'I',
    toolItalic: '斜体',
    toolLinkShort: '链接',
    toolLink: '插入链接',
    toolInlineCodeShort: '代码',
    toolInlineCode: '行内代码',
    toolCodeBlockShort: '代码块',
    toolCodeBlock: '插入代码块',
    toolQuoteShort: '引用',
    toolQuote: '引用',
    toolListShort: '列表',
    toolList: '无序列表',
    toolOrderedShort: '编号',
    toolOrdered: '有序列表',
    toolTableShort: '表格',
    toolTable: '插入表格',
    toolImageShort: '图片',
    toolImage: '插入图片',
    toolMathShort: '公式',
    toolMath: '插入数学公式',
    toolHrShort: '分割线',
    toolHr: '插入分割线',
    placeholderBold: '加粗文字',
    placeholderItalic: '斜体文字',
    placeholderLinkText: '链接文字',
    imageAltPlaceholder: '图片描述',
    tableColumnOne: '列一',
    tableColumnTwo: '列二',
    tableCell: '内容',
    unsupportedFile: '仅支持 .md 或 .txt 文件',
    confirmNewDocument: '清空当前内容并新建文档？当前草稿会被新的空文档覆盖。',
  },
  'zh-TW': {
    appName: 'PaperMD',
    statusLoading: '正在讀取本機草稿',
    statusRestored: '已恢復本機草稿',
    statusSaving: '正在自動儲存',
    statusSaved: ({ time }) => `已自動儲存 ${time}`,
    statusUnavailable: '本機儲存不可用',
    statusImported: ({ name }) => `已匯入 ${name}`,
    statusNew: '已新增空白文件',
    newDocument: '新增',
    newDocumentTitle: '新增文件',
    import: '匯入',
    importTitle: '匯入 Markdown 或文字檔',
    typesetting: '排版',
    openSettings: '開啟排版設定',
    lightMode: '日間',
    darkMode: '夜間',
    switchToLightMode: '切換到日間模式',
    switchToDarkMode: '切換到夜間模式',
    exportPdf: '匯出 PDF',
    exportPdfTitle: '匯出 PDF',
    language: '語言',
    editorKicker: 'Markdown',
    editorTitle: '編輯',
    editorAria: 'Markdown 編輯器',
    previewKicker: 'Preview',
    previewTitle: '即時預覽',
    previewAria: '即時預覽',
    wordCount: ({ count }) => `${count} 字`,
    lineCount: ({ count }) => `${count} 行`,
    toolbarAria: 'Markdown 快捷工具列',
    markdownContentAria: 'Markdown 內容',
    theme: '主題',
    previewThemeAria: '預覽主題',
    themeGithub: 'GitHub',
    themeMinimal: '簡約',
    settingsAria: 'PDF 排版設定',
    exportKicker: 'Export',
    settingsTitle: 'PDF 排版',
    closeSettings: '關閉設定',
    resetDefaults: '恢復預設參數',
    pageSize: '頁面大小',
    marginsMm: '頁邊距 mm',
    marginTop: '上',
    marginRight: '右',
    marginBottom: '下',
    marginLeft: '左',
    fontSizeLabel: ({ value }) => `內文字級 ${value}px`,
    lineHeightLabel: ({ value }) => `行距 ${value}`,
    mobileTabsAria: '行動裝置模式切換',
    editTab: '編輯',
    previewTab: '預覽',
    toolHeadingShort: 'H1',
    toolHeading: '一級標題',
    toolBoldShort: 'B',
    toolBold: '粗體',
    toolItalicShort: 'I',
    toolItalic: '斜體',
    toolLinkShort: '連結',
    toolLink: '插入連結',
    toolInlineCodeShort: '程式碼',
    toolInlineCode: '行內程式碼',
    toolCodeBlockShort: '程式碼塊',
    toolCodeBlock: '插入程式碼塊',
    toolQuoteShort: '引用',
    toolQuote: '引用',
    toolListShort: '清單',
    toolList: '無序清單',
    toolOrderedShort: '編號',
    toolOrdered: '有序清單',
    toolTableShort: '表格',
    toolTable: '插入表格',
    toolImageShort: '圖片',
    toolImage: '插入圖片',
    toolMathShort: '公式',
    toolMath: '插入數學公式',
    toolHrShort: '分隔線',
    toolHr: '插入分隔線',
    placeholderBold: '粗體文字',
    placeholderItalic: '斜體文字',
    placeholderLinkText: '連結文字',
    imageAltPlaceholder: '圖片描述',
    tableColumnOne: '欄一',
    tableColumnTwo: '欄二',
    tableCell: '內容',
    unsupportedFile: '僅支援 .md 或 .txt 檔案',
    confirmNewDocument: '要清空目前內容並新增文件嗎？目前草稿會被新的空白文件覆蓋。',
  },
  ja: {
    appName: 'PaperMD',
    statusLoading: 'ローカル下書きを読み込み中',
    statusRestored: 'ローカル下書きを復元しました',
    statusSaving: '自動保存中',
    statusSaved: ({ time }) => `自動保存しました ${time}`,
    statusUnavailable: 'ローカル保存を利用できません',
    statusImported: ({ name }) => `${name} を読み込みました`,
    statusNew: '空のドキュメントを作成しました',
    newDocument: '新規',
    newDocumentTitle: '新しいドキュメント',
    import: '読み込み',
    importTitle: 'Markdown またはテキストファイルを読み込む',
    typesetting: 'レイアウト',
    openSettings: 'PDF レイアウト設定を開く',
    lightMode: 'ライト',
    darkMode: 'ダーク',
    switchToLightMode: 'ライトモードに切り替える',
    switchToDarkMode: 'ダークモードに切り替える',
    exportPdf: 'PDF を出力',
    exportPdfTitle: 'PDF を出力',
    language: '言語',
    editorKicker: 'Markdown',
    editorTitle: '編集',
    editorAria: 'Markdown エディター',
    previewKicker: 'Preview',
    previewTitle: 'プレビュー',
    previewAria: 'リアルタイムプレビュー',
    wordCount: ({ count }) => `${count} 文字`,
    lineCount: ({ count }) => `${count} 行`,
    toolbarAria: 'Markdown ツールバー',
    markdownContentAria: 'Markdown コンテンツ',
    theme: 'テーマ',
    previewThemeAria: 'プレビューのテーマ',
    themeGithub: 'GitHub',
    themeMinimal: 'ミニマル',
    settingsAria: 'PDF レイアウト設定',
    exportKicker: 'Export',
    settingsTitle: 'PDF レイアウト',
    closeSettings: '設定を閉じる',
    resetDefaults: 'デフォルトに戻す',
    pageSize: 'ページサイズ',
    marginsMm: '余白 mm',
    marginTop: '上',
    marginRight: '右',
    marginBottom: '下',
    marginLeft: '左',
    fontSizeLabel: ({ value }) => `本文サイズ ${value}px`,
    lineHeightLabel: ({ value }) => `行間 ${value}`,
    mobileTabsAria: 'モバイル表示切り替え',
    editTab: '編集',
    previewTab: 'プレビュー',
    toolHeadingShort: 'H1',
    toolHeading: '見出し 1',
    toolBoldShort: '太字',
    toolBold: '太字',
    toolItalicShort: '斜体',
    toolItalic: '斜体',
    toolLinkShort: 'リンク',
    toolLink: 'リンクを挿入',
    toolInlineCodeShort: 'コード',
    toolInlineCode: 'インラインコード',
    toolCodeBlockShort: 'コードブロック',
    toolCodeBlock: 'コードブロックを挿入',
    toolQuoteShort: '引用',
    toolQuote: '引用',
    toolListShort: '箇条書き',
    toolList: '箇条書き',
    toolOrderedShort: '番号',
    toolOrdered: '番号付きリスト',
    toolTableShort: '表',
    toolTable: '表を挿入',
    toolImageShort: '画像',
    toolImage: '画像を挿入',
    toolMathShort: '数式',
    toolMath: '数式を挿入',
    toolHrShort: '区切り',
    toolHr: '区切り線を挿入',
    placeholderBold: '太字テキスト',
    placeholderItalic: '斜体テキスト',
    placeholderLinkText: 'リンクテキスト',
    imageAltPlaceholder: '画像の説明',
    tableColumnOne: '列 1',
    tableColumnTwo: '列 2',
    tableCell: '内容',
    unsupportedFile: '.md または .txt ファイルのみ対応しています',
    confirmNewDocument: '現在の内容を消去して新しいドキュメントを作成しますか？現在の下書きは空のドキュメントで上書きされます。',
  },
  en: {
    appName: 'PaperMD',
    statusLoading: 'Loading local draft',
    statusRestored: 'Local draft restored',
    statusSaving: 'Autosaving',
    statusSaved: ({ time }) => `Autosaved ${time}`,
    statusUnavailable: 'Local saving is unavailable',
    statusImported: ({ name }) => `Imported ${name}`,
    statusNew: 'Created a blank document',
    newDocument: 'New',
    newDocumentTitle: 'Create a new document',
    import: 'Import',
    importTitle: 'Import a Markdown or text file',
    typesetting: 'Layout',
    openSettings: 'Open PDF layout settings',
    lightMode: 'Light',
    darkMode: 'Dark',
    switchToLightMode: 'Switch to light mode',
    switchToDarkMode: 'Switch to dark mode',
    exportPdf: 'Export PDF',
    exportPdfTitle: 'Export PDF',
    language: 'Language',
    editorKicker: 'Markdown',
    editorTitle: 'Editor',
    editorAria: 'Markdown editor',
    previewKicker: 'Preview',
    previewTitle: 'Live preview',
    previewAria: 'Live preview',
    wordCount: ({ count }) => `${count} chars`,
    lineCount: ({ count }) => `${count} lines`,
    toolbarAria: 'Markdown toolbar',
    markdownContentAria: 'Markdown content',
    theme: 'Theme',
    previewThemeAria: 'Preview theme',
    themeGithub: 'GitHub',
    themeMinimal: 'Minimal',
    settingsAria: 'PDF layout settings',
    exportKicker: 'Export',
    settingsTitle: 'PDF layout',
    closeSettings: 'Close settings',
    resetDefaults: 'Reset defaults',
    pageSize: 'Page size',
    marginsMm: 'Margins mm',
    marginTop: 'Top',
    marginRight: 'Right',
    marginBottom: 'Bottom',
    marginLeft: 'Left',
    fontSizeLabel: ({ value }) => `Body size ${value}px`,
    lineHeightLabel: ({ value }) => `Line height ${value}`,
    mobileTabsAria: 'Mobile mode switcher',
    editTab: 'Edit',
    previewTab: 'Preview',
    toolHeadingShort: 'H1',
    toolHeading: 'Heading 1',
    toolBoldShort: 'Bold',
    toolBold: 'Bold',
    toolItalicShort: 'Italic',
    toolItalic: 'Italic',
    toolLinkShort: 'Link',
    toolLink: 'Insert link',
    toolInlineCodeShort: 'Code',
    toolInlineCode: 'Inline code',
    toolCodeBlockShort: 'Block',
    toolCodeBlock: 'Insert code block',
    toolQuoteShort: 'Quote',
    toolQuote: 'Quote',
    toolListShort: 'List',
    toolList: 'Bullet list',
    toolOrderedShort: 'Order',
    toolOrdered: 'Numbered list',
    toolTableShort: 'Table',
    toolTable: 'Insert table',
    toolImageShort: 'Image',
    toolImage: 'Insert image',
    toolMathShort: 'Math',
    toolMath: 'Insert math',
    toolHrShort: 'Rule',
    toolHr: 'Insert horizontal rule',
    placeholderBold: 'bold text',
    placeholderItalic: 'italic text',
    placeholderLinkText: 'link text',
    imageAltPlaceholder: 'image description',
    tableColumnOne: 'Column one',
    tableColumnTwo: 'Column two',
    tableCell: 'Content',
    unsupportedFile: 'Only .md and .txt files are supported',
    confirmNewDocument: 'Clear the current content and create a new document? The current draft will be replaced by a blank document.',
  },
}

const sampleMarkdownByLocale = {
  'zh-CN': `# PaperMD 示例文档

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
`,
  'zh-TW': `# PaperMD 範例文件

PaperMD 是一款純前端 Markdown 編輯器，支援即時預覽、本機草稿、行動端快速輸入，以及瀏覽器原生 PDF 匯出。

## 核心能力

- **即時預覽**：輸入後立即渲染 Markdown。
- *行動友善*：手機端可在編輯與預覽之間切換。
- 支援表格、程式碼高亮、外部圖片與數學公式。

> 匯出 PDF 時會套用右側排版設定，並呼叫系統列印視窗。

| 參數 | 說明 |
| --- | --- |
| 頁面 | A4 / A5 / Letter |
| 邊距 | 上、右、下、左可分別設定 |
| 字體 | 內文字級與行距可調 |

\`\`\`js
const message = 'Hello, PaperMD'
console.log(message)
\`\`\`

行內公式範例：$E = mc^2$

區塊公式範例：

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$
`,
  ja: `# PaperMD サンプルドキュメント

PaperMD はフロントエンドだけで動く Markdown エディターです。ライブプレビュー、ローカル下書き、モバイル入力、ブラウザー標準の PDF 出力に対応しています。

## 主な機能

- **ライブプレビュー**: 入力内容をすぐに反映します。
- *モバイル対応*: スマートフォンでは編集とプレビューを切り替えられます。
- 表、コードハイライト、外部画像、数式をサポートします。

> PDF を出力するときは、右側のレイアウト設定が反映され、システムの印刷ダイアログを開きます。

| 項目 | 説明 |
| --- | --- |
| ページ | A4 / A5 / Letter |
| 余白 | 上下左右を個別に設定可能 |
| 文字 | 本文サイズと行間を調整可能 |

\`\`\`js
const message = 'Hello, PaperMD'
console.log(message)
\`\`\`

インライン数式の例: $E = mc^2$

ブロック数式の例:

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$
`,
  en: `# PaperMD Sample Document

PaperMD is a browser-only Markdown editor with live preview, local drafts, mobile-friendly input, and native browser PDF export.

## Core capabilities

- **Live preview**: render Markdown as you type.
- *Mobile friendly*: switch between editing and preview on smaller screens.
- Supports tables, code highlighting, external images, and math.

> PDF export applies the layout settings from the right sidebar and then opens the system print dialog.

| Setting | Description |
| --- | --- |
| Page | A4 / A5 / Letter |
| Margins | Configure top, right, bottom, and left independently |
| Typography | Adjust body font size and line height |

\`\`\`js
const message = 'Hello, PaperMD'
console.log(message)
\`\`\`

Inline math example: $E = mc^2$

Block math example:

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$
`,
}

const sampleMarkdownSet = new Set(Object.values(sampleMarkdownByLocale))

export function resolveLocale(input) {
  const value = String(input || '').toLowerCase()

  if (value.startsWith('zh-tw') || value.startsWith('zh-hk') || value.startsWith('zh-mo') || value.startsWith('zh-hant')) {
    return 'zh-TW'
  }

  if (value.startsWith('ja')) {
    return 'ja'
  }

  if (value.startsWith('en')) {
    return 'en'
  }

  return DEFAULT_LOCALE
}

export function getMessage(locale, key, params = {}) {
  const normalizedLocale = resolveLocale(locale)
  const dictionary = messages[normalizedLocale] || messages[DEFAULT_LOCALE]
  const fallbackDictionary = messages[DEFAULT_LOCALE]
  const entry = dictionary[key] ?? fallbackDictionary[key] ?? key
  return typeof entry === 'function' ? entry(params) : entry
}

export function getSampleMarkdown(locale) {
  return sampleMarkdownByLocale[resolveLocale(locale)] || sampleMarkdownByLocale[DEFAULT_LOCALE]
}

export function isSampleMarkdown(value) {
  return sampleMarkdownSet.has(value)
}