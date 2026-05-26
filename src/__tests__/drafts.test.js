import { describe, expect, it } from 'vitest'
import {
  createDraft,
  deleteDraft,
  duplicateDraft,
  getDraftDisplayTitle,
  migrateLegacyDocument,
  renameDraft,
  sortDrafts,
  upsertDraft,
} from '../drafts.js'

describe('draft helpers', () => {
  it('creates drafts with title, timestamps, and word count metadata', () => {
    const draft = createDraft({
      content: '# My Draft\n\nBody',
      now: '2026-05-26T00:00:00.000Z',
      id: 'draft-1',
    })

    expect(draft).toMatchObject({
      id: 'draft-1',
      title: 'My Draft',
      content: '# My Draft\n\nBody',
      createdAt: '2026-05-26T00:00:00.000Z',
      updatedAt: '2026-05-26T00:00:00.000Z',
      wordCount: 12,
    })
  })

  it('keeps drafts sorted by most recent update', () => {
    const drafts = sortDrafts([
      { id: 'old', updatedAt: '2026-05-20T00:00:00.000Z' },
      { id: 'new', updatedAt: '2026-05-26T00:00:00.000Z' },
    ])

    expect(drafts.map((draft) => draft.id)).toEqual(['new', 'old'])
  })

  it('upserts, renames, duplicates, and deletes drafts immutably', () => {
    const first = createDraft({ id: 'a', content: '# A', now: '2026-05-26T00:00:00.000Z' })
    const updated = upsertDraft([first], { ...first, content: '# A updated', updatedAt: '2026-05-27T00:00:00.000Z' })
    const renamed = renameDraft(updated, 'a', 'Custom name')
    const duplicated = duplicateDraft(renamed, 'a', {
      id: 'b',
      now: '2026-05-28T00:00:00.000Z',
      copySuffix: 'Copy',
    })

    expect(getDraftDisplayTitle(renamed[0])).toBe('Custom name')
    expect(duplicated).toHaveLength(2)
    expect(duplicated[0].id).toBe('b')
    expect(deleteDraft(duplicated, 'a').map((draft) => draft.id)).toEqual(['b'])
  })

  it('migrates the legacy single last-document value into a draft state', () => {
    expect(migrateLegacyDocument('# Legacy')).toMatchObject({
      currentDraftId: expect.any(String),
      drafts: [expect.objectContaining({ title: 'Legacy', content: '# Legacy' })],
    })
  })
})
