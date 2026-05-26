export function continueMarkdownList(text, selectionStart, selectionEnd) {
  if (selectionStart !== selectionEnd) return null

  const source = String(text || '')
  const lineStart = source.lastIndexOf('\n', selectionStart - 1) + 1
  const line = source.slice(lineStart, selectionStart)
  const unordered = line.match(/^(\s*)([-+*])\s+(.*)$/)
  const ordered = line.match(/^(\s*)(\d+)([.)])\s+(.*)$/)

  if (!unordered && !ordered) return null

  if (unordered) {
    const [, indent, marker, body] = unordered
    if (!body.trim()) {
      return removeCurrentListMarker(source, lineStart, selectionStart)
    }

    return insertContinuation(source, selectionStart, `${indent}${marker} `)
  }

  const [, indent, number, delimiter, body] = ordered
  if (!body.trim()) {
    return removeCurrentListMarker(source, lineStart, selectionStart)
  }

  return insertContinuation(source, selectionStart, `${indent}${Number(number) + 1}${delimiter} `)
}

export function toggleTaskAtLine(text, lineIndex) {
  const lines = String(text || '').split('\n')
  const line = lines[lineIndex]

  if (line === undefined) return text

  lines[lineIndex] = line.replace(/^(\s*(?:[-+*]|\d+[.)])\s+\[)([ xX])(\]\s+.*)$/, (_match, before, state, after) => {
    const nextState = state.toLowerCase() === 'x' ? ' ' : 'x'
    return `${before}${nextState}${after}`
  })

  return lines.join('\n')
}

export function insertImageMarkdown(text, selectionStart, selectionEnd, fileName, dataUrl) {
  const source = String(text || '')
  const alt = String(fileName || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[\[\]\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'image'
  const before = selectionStart > 0 && source[selectionStart - 1] !== '\n' ? '\n' : ''
  const after = selectionEnd < source.length && source[selectionEnd] !== '\n' ? '\n' : ''
  const insert = `${before}![${alt}](${dataUrl})${after || '\n'}`
  const nextText = `${source.slice(0, selectionStart)}${insert}${source.slice(selectionEnd)}`
  const nextPosition = selectionStart + insert.length

  return {
    text: nextText,
    selectionStart: nextPosition,
    selectionEnd: nextPosition,
  }
}

function insertContinuation(text, at, marker) {
  const insert = `\n${marker}`
  const nextPosition = at + insert.length

  return {
    text: `${text.slice(0, at)}${insert}${text.slice(at)}`,
    selectionStart: nextPosition,
    selectionEnd: nextPosition,
  }
}

function removeCurrentListMarker(text, lineStart, at) {
  return {
    text: `${text.slice(0, lineStart)}${text.slice(at)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart,
  }
}
