import { useEffect, useRef, useState } from 'react'
import { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'
import type { User } from '../model'
import { syncYDoc, type YDocClient } from './yDoc'

export type YBoard = {
  doc: Y.Doc
  /** Presence of the participants. The local state starts as `{ user: { id, name } }`: each app adds its own fields */
  awareness: Awareness
}

/**
 * The Yjs document of a `defineYDocApp` board, synced with the server while the component is mounted.
 * `board` is null until the first state of the board has been received.
 *
 * @example useYDoc({ client: trpc.useUtils().client.paint, boardId, user })
 */
export const useYDoc = ({ client, boardId, user }: { client: YDocClient; boardId: string; user: User }) => {
  // the tRPC client gives a new proxy at each property access (`client.paint`): the first one is kept
  const clientRef = useRef(client)
  const [board, setBoard] = useState<YBoard | null>(null)
  const [synced, setSynced] = useState(false)
  // the last push failed: some local changes are not on the server yet
  const [unsent, setUnsent] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    // created in the effect, not during render: each mount gets its own document, destroyed with it
    const doc = new Y.Doc()
    const awareness = new Awareness(doc)
    awareness.setLocalState({ user: { id: user.id, name: user.pseudo } })
    setBoard({ doc, awareness })
    setSynced(false)
    setUnsent(false)
    setError(undefined)

    const disconnect = syncYDoc({
      client: clientRef.current,
      boardId,
      doc,
      awareness,
      onStatus: change => {
        if (change.synced !== undefined) setSynced(change.synced)
        if (change.unsent !== undefined) setUnsent(change.unsent)
        if (change.error !== undefined) setError(change.error)
      }
    })

    return () => {
      disconnect()
      awareness.destroy()
      doc.destroy()
    }
  }, [boardId, user.id, user.pseudo])

  return { board: synced ? board : null, unsent, error }
}
