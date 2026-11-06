import type { User } from '@platform/model'
import { useEffect, useState } from 'react'
import { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'
import { localPeerState } from './peers'
import { type SyncStatus, syncBoardDoc } from './syncBoardDoc'
import { trpc } from './trpc'

export type BoardDoc = {
  doc: Y.Doc
  /** The text of the board */
  ytext: Y.Text
  awareness: Awareness
}

/** The Yjs document of a Word board, synced with the server while the component is mounted */
export const useBoardDoc = (boardId: string, user: User) => {
  const { client } = trpc.useUtils()
  const [board, setBoard] = useState<BoardDoc | null>(null)
  const [status, setStatus] = useState<SyncStatus>({ synced: false, unsent: false })

  useEffect(() => {
    // created in the effect, not during render: each mount gets its own document, destroyed with it
    const doc = new Y.Doc()
    const awareness = new Awareness(doc)
    awareness.setLocalState(localPeerState(user.id, user.pseudo))
    setBoard({ doc, ytext: doc.getText('content'), awareness })
    setStatus({ synced: false, unsent: false })

    const disconnect = syncBoardDoc({
      client: client.word,
      boardId,
      doc,
      awareness,
      // keeps the same object when nothing changes: no re-render (a push reports its status after every keystroke)
      onStatus: change =>
        setStatus(current =>
          Object.entries(change).every(([key, value]) => current[key as keyof SyncStatus] === value) ? current : { ...current, ...change }
        )
    })

    return () => {
      disconnect()
      awareness.destroy()
      doc.destroy()
    }
  }, [client, boardId, user.id, user.pseudo])

  return { board, ...status }
}
