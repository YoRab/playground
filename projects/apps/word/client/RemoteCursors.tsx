import { peerColorVar, usePeers, type YBoard } from '@platform/client'
import type { CSSProperties, ReactNode } from 'react'
import type * as Y from 'yjs'
import { cursorStateSchema, toIndex } from './peers'
import classes from './Word.module.css'

type Range = { clientId: number; name: string; color: string; anchor: number; head: number }

const colorStyle = (color: string) => ({ '--peer-color': peerColorVar(color) }) as CSSProperties

/**
 * The carets and selections of the other participants, drawn over the textarea (which can only show its own caret).
 * It is a mirror of the textarea: same text and same typography (`.surface`) so that the text wraps at the same places,
 * but transparent, with the remote selections highlighted and a marker at each remote caret.
 */
const RemoteCursors = ({ doc, awareness, text }: { doc: Y.Doc; awareness: YBoard['awareness']; text: string }) => {
  const peers = usePeers(awareness, cursorStateSchema)
  const clamp = (index: number) => Math.min(Math.max(index, 0), text.length)

  const ranges = peers.flatMap((peer): Range[] => {
    if (peer.clientId === doc.clientID || !peer.cursor) return []
    const anchor = toIndex(doc, peer.cursor.anchor)
    const head = toIndex(doc, peer.cursor.head)
    if (anchor === null || head === null) return []
    return [{ clientId: peer.clientId, name: peer.user.name, color: peer.color, anchor: clamp(anchor), head: clamp(head) }]
  })

  // cut the text at every bound of a selection and at every caret
  const points = [...new Set([0, text.length, ...ranges.flatMap(range => [range.anchor, range.head])])].sort((a, b) => a - b)
  const nodes: ReactNode[] = []
  points.forEach((at, i) => {
    for (const range of ranges) {
      if (range.head !== at) continue
      nodes.push(
        <span key={`caret-${range.clientId}`} className={classes.caret} style={colorStyle(range.color)}>
          <span className={classes.caretLabel}>{range.name}</span>
        </span>
      )
    }
    const next = points[i + 1]
    if (next === undefined) return
    const selection = ranges.find(range => Math.min(range.anchor, range.head) <= at && next <= Math.max(range.anchor, range.head))
    nodes.push(
      <span key={`text-${at}`} className={selection ? classes.selection : undefined} style={selection ? colorStyle(selection.color) : undefined}>
        {text.slice(at, next)}
      </span>
    )
  })

  return (
    <div className={`${classes.surface} ${classes.overlay}`} aria-hidden>
      {nodes}
      {/* a trailing line break only makes a new line when something follows it, as in the textarea */}
      {'​'}
    </div>
  )
}

export default RemoteCursors
