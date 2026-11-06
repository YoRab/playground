import { type ChangeEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type * as Y from 'yjs'
import { toRelativePosition } from './peers'
import type { BoardDoc } from './useBoardDoc'

const isHighSurrogate = (code: number) => code >= 0xd800 && code <= 0xdbff
const isLowSurrogate = (code: number) => code >= 0xdc00 && code <= 0xdfff

/**
 * The edit that turns `prev` into `next`: what lies between their common prefix and suffix
 * (a typed character, a paste, a deletion…). Never splits a surrogate pair (emoji): Yjs would replace its halves with "�".
 */
export const diffText = (prev: string, next: string) => {
  const max = Math.min(prev.length, next.length)
  let start = 0
  while (start < max && prev.charCodeAt(start) === next.charCodeAt(start)) start++
  if (start > 0 && isHighSurrogate(prev.charCodeAt(start - 1))) start--
  let end = 0
  while (end < max - start && prev.charCodeAt(prev.length - 1 - end) === next.charCodeAt(next.length - 1 - end)) end++
  if (end > 0 && isLowSurrogate(prev.charCodeAt(prev.length - end))) end--
  return { index: start, removed: prev.length - start - end, inserted: next.slice(start, next.length - end) }
}

/**
 * Where `index` lands once a remote `delta` (expressed in the previous text) is applied.
 * Text inserted right at `index` goes after it: two people typing at the same place do not interleave their characters.
 */
export const transformIndex = (index: number, delta: Y.YTextEvent['delta']) => {
  let position = 0
  let transformed = index
  for (const op of delta) {
    if (position >= index) break
    if (op.retain !== undefined) {
      position += op.retain
    } else if (op.insert !== undefined) {
      transformed += typeof op.insert === 'string' ? op.insert.length : 1
    } else if (op.delete !== undefined) {
      transformed -= Math.min(op.delete, index - position)
      position += op.delete
    }
  }
  return transformed
}

/**
 * Binds a `<textarea>` to the text of the board: local edits go to Yjs, remote ones are written to the textarea
 * without moving the caret, and the local selection is published in the awareness (the others display it).
 */
export const useYTextarea = ({ doc, ytext, awareness }: BoardDoc) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState(() => ytext.toString())

  useEffect(() => {
    const observer = (event: Y.YTextEvent) => {
      const textarea = ref.current
      const next = ytext.toString()
      if (!event.transaction.local && textarea) {
        // written to the DOM right away (not at the next render): the next keystroke is diffed against an up to date value
        const { selectionStart, selectionEnd, selectionDirection } = textarea
        const focused = document.activeElement === textarea
        textarea.value = next
        if (focused) {
          textarea.setSelectionRange(transformIndex(selectionStart, event.delta), transformIndex(selectionEnd, event.delta), selectionDirection)
        }
      }
      setText(next)
    }
    setText(ytext.toString())
    ytext.observe(observer)
    return () => ytext.unobserve(observer)
  }, [ytext])

  // grows with its content: the overlay of the remote cursors then never has to follow a scroll
  const fitHeight = useCallback(() => {
    const textarea = ref.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])
  // biome-ignore lint/correctness/useExhaustiveDependencies: the height depends on the text
  useLayoutEffect(fitHeight, [fitHeight, text])
  // the width (so the wrapping) also changes without the window being resized: layout, scrollbar, font loading…
  useEffect(() => {
    const textarea = ref.current
    if (!textarea) return
    let width = textarea.offsetWidth
    const observer = new ResizeObserver(() => {
      // only a width change moves the wrapping (and fitHeight itself changes the height: no loop)
      if (textarea.offsetWidth === width) return
      width = textarea.offsetWidth
      fitHeight()
    })
    observer.observe(textarea)
    return () => observer.disconnect()
  }, [fitHeight])

  const publishCursor = () => {
    const textarea = ref.current
    if (!textarea) return
    const { selectionStart, selectionEnd, selectionDirection } = textarea
    const [anchor, head] = selectionDirection === 'backward' ? [selectionEnd, selectionStart] : [selectionStart, selectionEnd]
    const cursor = { anchor: toRelativePosition(ytext, anchor), head: toRelativePosition(ytext, head) }
    // every call is broadcast: skip the ones that change nothing
    if (JSON.stringify(cursor) === JSON.stringify(awareness.getLocalState()?.cursor)) return
    awareness.setLocalStateField('cursor', cursor)
  }

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { index, removed, inserted } = diffText(ytext.toString(), event.target.value)
    doc.transact(() => {
      if (removed > 0) ytext.delete(index, removed)
      if (inserted) ytext.insert(index, inserted)
    })
    publishCursor()
  }

  return {
    text,
    textareaProps: {
      ref,
      value: text,
      onChange,
      onSelect: publishCursor,
      onFocus: publishCursor,
      onBlur: () => awareness.setLocalStateField('cursor', null)
    }
  }
}
