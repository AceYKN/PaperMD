# PaperMD

PaperMD 是一款纯前端 Markdown 编辑器，面向桌面与移动端浏览器。它支持实时预览、本地自动保存、Markdown 文件导入、预览主题切换，以及基于浏览器原生打印能力的可配置 PDF 导出。

## 功能

- Vue 3 + Vite，零后端部署。
- 桌面端双栏编辑/预览，移动端编辑与预览 Tab 切换。
- 500ms 防抖自动保存到 `localStorage`。
- 支持 `.md` / `.txt` 本地文件导入。
- 支持标题、列表、引用、表格、代码高亮、外链/Base64 图片、KaTeX 数学公式。
- 提供 GitHub 与简约两套预览主题。
- 支持 A4、A5、Letter 纸张，独立页边距、字体大小、行距配置。
- 通过 `@page` + `window.print()` 调用系统打印，用户可选择另存为 PDF。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

GitHub Pages 部署由 `.github/workflows/deploy.yml` 在推送到 `main` 分支时自动执行。
