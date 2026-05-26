export function findMatches(text, query, options = {}) {
  const source = String(text || '')
  const needle = String(query || '')
  if (!needle) return []

  return options.regex
    ? findRegexMatches(source, needle, Boolean(options.caseSensitive))
    : findPlainMatches(source, needle, Boolean(options.caseSensitive))
}

export function replaceSingleMatch(text, match, replacement) {
  if (!match || match.index < 0 || match.length < 0) return text

  const source = String(text || '')
  return `${source.slice(0, match.index)}${replacement}${source.slice(match.index + match.length)}`
}

export function replaceAllMatches(text, query, replacement, options = {}) {
  const matches = findMatches(text, query, options)
  if (!matches.length) {
    return { text, count: 0 }
  }

  if (options.regex) {
    try {
      const flags = `g${options.caseSensitive ? '' : 'i'}`
      const re = new RegExp(query, flags)
      return {
        text: String(text || '').replace(re, replacement),
        count: matches.length,
      }
    } catch {
      return { text, count: 0 }
    }
  }

  const next = matches
    .slice()
    .reverse()
    .reduce((current, match) => replaceSingleMatch(current, match, replacement), String(text || ''))

  return {
    text: next,
    count: matches.length,
  }
}

export function getNextMatchIndex(matches, currentIndex = -1) {
  if (!matches.length) return -1
  if (currentIndex < 0) return 0

  return (currentIndex + 1) % matches.length
}

export function getPreviousMatchIndex(matches, currentIndex = -1) {
  if (!matches.length) return -1
  if (currentIndex <= 0) return matches.length - 1

  return currentIndex - 1
}

function findPlainMatches(source, query, caseSensitive) {
  const haystack = caseSensitive ? source : source.toLowerCase()
  const needle = caseSensitive ? query : query.toLowerCase()
  const matches = []
  let index = haystack.indexOf(needle)

  while (index !== -1) {
    matches.push({
      index,
      length: query.length,
      text: source.slice(index, index + query.length),
    })
    index = haystack.indexOf(needle, index + Math.max(1, query.length))
  }

  return matches
}

function findRegexMatches(source, query, caseSensitive) {
  try {
    const re = new RegExp(query, `g${caseSensitive ? '' : 'i'}`)
    const matches = []
    let match

    while ((match = re.exec(source))) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
      })

      if (match[0].length === 0) {
        re.lastIndex += 1
      }
    }

    return matches
  } catch {
    return []
  }
}
