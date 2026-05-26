import { DEFAULT_DOCUMENT_TITLE, extractDocumentTitle } from './document.js'

export const DRAFTS_KEY = 'papermd:drafts'
export const CURRENT_DRAFT_KEY = 'papermd:current-draft-id'
export const LEGACY_STORAGE_KEY = 'papermd:last-document'

export function createDraft({ content = '', title, id, now } = {}) {
  const timestamp = now || new Date().toISOString()
  const draftTitle = title || extractDocumentTitle(content, DEFAULT_DOCUMENT_TITLE)

  return {
    id: id || createDraftId(),
    title: draftTitle,
    manualTitle: Boolean(title),
    content,
    createdAt: timestamp,
    updatedAt: timestamp,
    wordCount: countCharacters(content),
  }
}

export function normalizeDraft(draft) {
  const content = String(draft?.content || '')
  const title = String(draft?.title || extractDocumentTitle(content, DEFAULT_DOCUMENT_TITLE))

  return {
    id: draft?.id || createDraftId(),
    title,
    manualTitle: Boolean(draft?.manualTitle),
    content,
    createdAt: draft?.createdAt || new Date().toISOString(),
    updatedAt: draft?.updatedAt || draft?.createdAt || new Date().toISOString(),
    wordCount: countCharacters(content),
  }
}

export function getDraftDisplayTitle(draft) {
  if (!draft) return DEFAULT_DOCUMENT_TITLE
  if (draft.manualTitle && draft.title) return draft.title

  return extractDocumentTitle(draft.content, draft.title || DEFAULT_DOCUMENT_TITLE)
}

export function sortDrafts(drafts) {
  return [...drafts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function upsertDraft(drafts, draft) {
  const normalized = normalizeDraft(draft)
  const exists = drafts.some((item) => item.id === normalized.id)
  const next = exists
    ? drafts.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...drafts]

  return sortDrafts(next)
}

export function renameDraft(drafts, id, title) {
  return drafts.map((draft) =>
    draft.id === id
      ? {
          ...draft,
          title: String(title || '').trim() || getDraftDisplayTitle(draft),
          manualTitle: true,
          updatedAt: new Date().toISOString(),
        }
      : draft,
  )
}

export function duplicateDraft(drafts, id, options = {}) {
  const source = drafts.find((draft) => draft.id === id)
  if (!source) return drafts

  const suffix = options.copySuffix || 'Copy'
  const copy = createDraft({
    id: options.id,
    now: options.now,
    title: `${getDraftDisplayTitle(source)} ${suffix}`,
    content: source.content,
  })

  return sortDrafts([copy, ...drafts])
}

export function deleteDraft(drafts, id) {
  return drafts.filter((draft) => draft.id !== id)
}

export function migrateLegacyDocument(content) {
  const draft = createDraft({ content })

  return {
    currentDraftId: draft.id,
    drafts: [draft],
  }
}

export function loadDraftState(storage, sampleContent) {
  try {
    const storedDrafts = JSON.parse(storage.getItem(DRAFTS_KEY) || '[]')
    const drafts = Array.isArray(storedDrafts) ? sortDrafts(storedDrafts.map(normalizeDraft)) : []
    const currentDraftId = storage.getItem(CURRENT_DRAFT_KEY)

    if (drafts.length) {
      return {
        currentDraftId: drafts.some((draft) => draft.id === currentDraftId) ? currentDraftId : drafts[0].id,
        drafts,
      }
    }

    const legacy = storage.getItem(LEGACY_STORAGE_KEY)
    if (legacy !== null) {
      return migrateLegacyDocument(legacy)
    }

    return migrateLegacyDocument(sampleContent)
  } catch {
    return migrateLegacyDocument(sampleContent)
  }
}

export function saveDraftState(storage, drafts, currentDraftId) {
  storage.setItem(DRAFTS_KEY, JSON.stringify(sortDrafts(drafts.map(normalizeDraft))))
  storage.setItem(CURRENT_DRAFT_KEY, currentDraftId || '')
}

export function countCharacters(value) {
  return String(value || '').replace(/\s/g, '').length
}

function createDraftId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
