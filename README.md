# PaperMD

PaperMD 是一款纯前端 Markdown 编辑器，面向桌面与移动端浏览器。它支持实时预览、本地自动保存、Markdown 文件导入、预览主题切换，以及基于浏览器原生打印能力的可配置 PDF 导出。

## 功能

- Vue 3 + Vite，零后端部署。
- 桌面端双栏编辑/预览，移动端编辑与预览 Tab 切换。
- 500ms 防抖自动保存到 `localStorage`。
- 支持多草稿 / 最近文档：自动标题、更新时间、字数、重命名、复制、删除。
- 支持 `.md` / `.txt` 本地文件导入。
- 支持导出 Markdown、HTML 与 PDF，并从第一个 H1 自动生成文件名。
- 支持简体中文、繁体中文、日文、英文界面切换。
- 支持标题、任务列表、脚注、目录锚点、HTML 片段、Mermaid 图表、表格、代码高亮、外链/Base64 图片、KaTeX 数学公式。
- 支持查找 / 替换、大小写匹配、正则匹配、大纲导航、双栏滚动同步。
- 支持快捷键：Ctrl/Cmd+B、I、K、S、P。
- 支持列表回车自动续行，空列表项回车退出列表。
- 提供 GitHub 与简约两套预览主题。
- 排版侧边栏支持点击空白区域快速收起。
- 支持论文、报告、简历、讲义、GitHub 风格导出预设。
- 支持 A4、A5、Letter 纸张，独立页边距、字体、字号、行距、目录页、页眉页脚配置。
- 通过 `@page` + `window.print()` 调用系统打印，夜间模式下导出会自动切换到适合打印的浅色配色。

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
