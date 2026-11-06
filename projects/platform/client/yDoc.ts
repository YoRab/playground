import { fromBase64, toBase64 } from 'lib0/buffer'
import { type Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness'
import * as Y from 'yjs'
import type { AwarenessChanges, YDocChange, YDocSnapshot } from '../server/yDocApp'

/**
 * The procedures of a `defineYDocApp` board, as the vanilla tRPC client gives them: `trpc.useUtils().client.<app type>`.
 * Typed by their shape, so that any app fits.
 */
export type YDocClient = {
  sync: {
    subscribe: (
      input: { boardId: string; clientId: number },
      observer: { onData: (message: YDocSnapshot | YDocChange) => void; onError: (err: { message: string }) => void }
    ) => { unsubscribe: () => void }
  }
  push: { mutate: (input: { boardId: string; update: string }) => Promise<string> }
  pushAwareness: { mutate: (input: { boardId: string; update: string }) => Promise<unknown> }
}

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
export const syncYDoc = ({
  client,
  boardId,
  doc,
  awareness,
  onStatus
}: {
  client: YDocClient
  boardId: string
  doc: Y.Doc
  awareness: Awareness
  onStatus: (status: Partial<SyncStatus>) => void
}) => {
  // What the server holds, as far as we know (null until the first sync). Each push sends everything it lacks,
  // so a push that succeeds also delivers the changes of the pushes that failed (network error, offline edits).
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

  // like the document: one request at a time, the latest state leaves with the next one (a moving pointer changes it 20 times a second)
  let pushingAwareness = false
  let awarenessChanged = false

  const pushLocalAwareness = async () => {
    if (disconnected || serverStateVector === null) return
    if (pushingAwareness) {
      awarenessChanged = true
      return
    }
    pushingAwareness = true
    awarenessChanged = false
    try {
      await client.pushAwareness.mutate({ boardId, update: toBase64(encodeAwarenessUpdate(awareness, [doc.clientID])) })
    } catch {
      // not worth a retry: the awareness renews the local state every 15 s
    }
    pushingAwareness = false
    if (awarenessChanged) void pushLocalAwareness()
  }

  const onDocUpdate = (_update: Uint8Array, origin: unknown) => {
    if (origin === REMOTE) return
    needsPush = true
    void pushDoc()
  }

  // whatever the origin: a remote update that removes our own state (stale disconnection) must be answered
  // with our state, which the awareness has just re-stamped with a newer clock
  const onAwarenessUpdate = ({ added, updated, removed }: AwarenessChanges) => {
    if (added.includes(doc.clientID) || updated.includes(doc.clientID) || removed.includes(doc.clientID)) void pushLocalAwareness()
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
            void pushLocalAwareness()
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
