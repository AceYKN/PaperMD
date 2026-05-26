import { describe, expect, it } from 'vitest'
import { findMatches, replaceAllMatches, replaceSingleMatch } from '../findReplace.js'

describe('find and replace helpers', () => {
  it('finds plain-text matches case-insensitively by default', () => {
    expect(findMatches('Alpha beta ALPHA', 'alpha')).toEqual([
      { index: 0, length: 5, text: 'Alpha' },
      { index: 11, length: 5, text: 'ALPHA' },
    ])
  })

  it('honors case-sensitive plain-text searches', () => {
    expect(findMatches('Alpha alpha', 'alpha', { caseSensitive: true })).toEqual([
      { index: 6, length: 5, text: 'alpha' },
    ])
  })

  it('supports regular-expression searches', () => {
    expect(findMatches('v1 v22 v333', 'v\\d+', { regex: true })).toEqual([
      { index: 0, length: 2, text: 'v1' },
      { index: 3, length: 3, text: 'v22' },
      { index: 7, length: 4, text: 'v333' },
    ])
  })

  it('replaces one selected match', () => {
    expect(replaceSingleMatch('one two one', { index: 8, length: 3 }, 'three')).toBe('one two three')
  })

  it('replaces all matches and reports the count', () => {
    expect(replaceAllMatches('one two one', 'one', '1')).toEqual({
      text: '1 two 1',
      count: 2,
    })
  })
})
