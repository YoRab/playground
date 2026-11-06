import { useEffect, useState } from 'react'
import type { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'
import { z } from 'zod'

/** Mantine colors given to the participants, picked from their user id */
const PEER_COLORS = ['blue', 'red', 'teal', 'grape', 'orange', 'cyan', 'pink', 'lime', 'violet', 'indigo'] as const

const colorOf = (userId: string) => {
  let hash = 0
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return PEER_COLORS[Math.abs(hash) % PEER_COLORS.length]
}

/** CSS value of a participant color */
export const peerColorVar = (color: string) => `var(--mantine-color-${color}-6)`

// the states come from the other clients: validated before use
const peerStateSchema = z.object({
  user: z.object({ id: z.string(), name: z.string() }),
  /** Selection in the text, as Yjs relative positions (JSON): they follow the text as it changes */
  cursor: z.object({ anchor: z.unknown(), head: z.unknown() }).nullable()
})

/** Awareness state of one participant (one tab) */
type PeerState = z.infer<typeof peerStateSchema>

/** A participant (one tab): its awareness state, plus its Mantine color (derived from the user id, so not published) */
export type Peer = PeerState & { clientId: number; color: string }

/** Awareness state of the local participant: the first one published */
export const localPeerState = (id: string, name: string): PeerState => ({ user: { id, name }, cursor: null })

const readPeers = (awareness: Awareness): Peer[] =>
  [...awareness.getStates()].flatMap(([clientId, state]) => {
    const parsed = peerStateSchema.safeParse(state)
    return parsed.success ? [{ clientId, ...parsed.data, color: colorOf(parsed.data.user.id) }] : []
  })

/** Every participant of the board, the local one included (`clientId === doc.clientID`) */
export const usePeers = (awareness: Awareness) => {
  const [peers, setPeers] = useState(() => readPeers(awareness))

  useEffect(() => {
    const onChange = () => setPeers(readPeers(awareness))
    onChange()
    awareness.on('change', onChange)
    return () => awareness.off('change', onChange)
  }, [awareness])

  return peers
}

/** Relative position (JSON) of an index of `ytext`, attached to the character on its left like the local caret */
export const toRelativePosition = (ytext: Y.Text, index: number): unknown =>
  Y.relativePositionToJSON(Y.createRelativePositionFromTypeIndex(ytext, index, -1))

/** Current index of a relative position received from a peer, or null when it cannot be resolved */
export const toIndex = (doc: Y.Doc, position: unknown): number | null => {
  try {
    return Y.createAbsolutePositionFromRelativePosition(Y.createRelativePositionFromJSON(position), doc)?.index ?? null
  } catch {
    return null
  }
}
