import { fromBase64, toBase64 } from 'lib0/buffer'
import { type Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import * as Y from 'yjs'
import type { trpc } from './trpc'

type WordClient = ReturnType<typeof trpc.useUtils>['client']['word']

/** Argument of the awareness `update` event: the ids of the clients whose state changed */
type AwarenessChanges = { added: number[]; updated: number[]; removed: number[] }

/** Origin of the changes received from the server: they must not be sent back */
const REMOTE = Symbol('remote')

const RETRY_DELAY_MS = 2000

export type SyncStatus = {
  /** The first state of the board has been received */
  synced: boolean
  /** The last push failed: some local changes are not on the server yet (retried until it works) */
  unsent: boolean
  /** The subscription failed (unknown board…) */
  error?: string
}

/**
 * Keeps `doc` and `awareness` in sync with a `defineYDocApp` board over tRPC:
 * the `sync` subscription brings the changes of the others, `push` / `pushAwareness` send the local ones.
 * Returns the function that disconnects.
 */
export const syncBoardDoc = ({
  client,
  boardId,
  doc,
  awareness,
  onStatus
}: {
  client: WordClient
  boardId: string
  doc: Y.Doc
  awareness: Awareness
  onStatus: (status: Partial<SyncStatus>) => void
}) => {
  // What the server holds, as far as we know (null until the first sync). Each push sends everything it lacks,
  // so a push that succeeds also delivers the changes of the pushes that failed (network error, offline typing).
  let serverStateVector: Uint8Array | null = null
  // local changes that the server may not have
  let needsPush = false
  let pushing = false
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let disconnected = false

  const pushDoc = async () => {
    // one push at a time: the changes made meanwhile leave with the next one
    if (disconnected || pushing || !needsPush || serverStateVector === null) return
    pushing = true
    needsPush = false
    clearTimeout(retryTimer)
    let failed = false
    try {
      const update = toBase64(Y.encodeStateAsUpdate(doc, serverStateVector))
      serverStateVector = fromBase64(await client.push.mutate({ boardId, update }))
    } catch {
      failed = true
      needsPush = true
    }
    pushing = false
    if (disconnected) return
    onStatus({ unsent: failed })
    if (failed) retryTimer = setTimeout(pushDoc, RETRY_DELAY_MS)
    else void pushDoc()
  }

  const pushLocalAwareness = () => {
    if (disconnected || serverStateVector === null) return
    const update = toBase64(encodeAwarenessUpdate(awareness, [doc.clientID]))
    // not worth a retry: the awareness renews the local state every 15 s
    client.pushAwareness.mutate({ boardId, update }).catch(() => {})
  }

  const onDocUpdate = (_update: Uint8Array, origin: unknown) => {
    if (origin === REMOTE) return
    needsPush = true
    void pushDoc()
  }

  // whatever the origin: a remote update that removes our own state (stale disconnection) must be answered
  // with our state, which the awareness has just re-stamped with a newer clock
  const onAwarenessUpdate = ({ added, updated, removed }: AwarenessChanges) => {
    if ([...added, ...updated, ...removed].includes(doc.clientID)) pushLocalAwareness()
  }

  doc.on('update', onDocUpdate)
  awareness.on('update', onAwarenessUpdate)

  const subscription = client.sync.subscribe(
    { boardId, clientId: doc.clientID },
    {
      onData(message) {
        switch (message.kind) {
          case 'sync':
            // first message, and again after each reconnection of the WebSocket
            Y.applyUpdate(doc, fromBase64(message.update), REMOTE)
            applyAwarenessUpdate(awareness, fromBase64(message.awareness), REMOTE)
            serverStateVector = fromBase64(message.stateVector)
            onStatus({ synced: true })
            void pushDoc()
            pushLocalAwareness()
            break
          case 'update':
            Y.applyUpdate(doc, fromBase64(message.update), REMOTE)
            break
          case 'awareness':
            applyAwarenessUpdate(awareness, fromBase64(message.update), REMOTE)
            break
        }
      },
      onError(err) {
        console.error('Subscription error:', err)
        onStatus({ error: err.message })
      }
    }
  )

  return () => {
    disconnected = true
    clearTimeout(retryTimer)
    doc.off('update', onDocUpdate)
    awareness.off('update', onAwarenessUpdate)
    // the server removes our awareness state when the subscription ends
    subscription.unsubscribe()
  }
}
