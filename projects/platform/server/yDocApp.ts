import { fromBase64, toBase64 } from 'lib0/buffer'
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness'
import * as Y from 'yjs'
import { z } from 'zod'
import { createBoardStore } from './boardStore'
import { defineServerApp } from './defineApp'
import { createTopic } from './realtime'
import { protectedProcedure, TRPCError } from './trpc'

/** A change relayed to every client of a board. Binary Yjs payloads travel base64 encoded: tRPC speaks JSON. */
type YDocChange = { kind: 'update' | 'awareness'; update: string }

/** First message of a `sync` subscription: the whole state of the board */
type YDocSnapshot = { kind: 'sync'; update: string; stateVector: string; awareness: string }

/** Argument of the awareness `update` event: the ids of the clients whose state changed */
type AwarenessChanges = { added: number[]; updated: number[]; removed: number[] }

// a keystroke weighs a few dozen bytes: this only stops abuse (about 1 MB of binary)
const updateInput = z.object({ boardId: z.string(), update: z.string().max(1_500_000) })

/**
 * Server side of an app whose board is a Yjs document (CRDT: concurrent edits merge instead of overwriting each other),
 * plus the awareness of its clients (cursors, selections…). The server keeps the document in memory and relays the changes:
 * - `sync({ boardId, clientId })`: yields a `YDocSnapshot`, then every `YDocChange`. `clientId` is the `doc.clientID`
 *   of the client: its awareness state is removed when the subscription ends.
 * - `push({ boardId, update })`: applies a document update, returns the new state vector of the server.
 * - `pushAwareness({ boardId, update })`: applies an awareness update.
 *
 * @example defineYDocApp({ type: 'word' })
 */
export const defineYDocApp = <const TType extends string>({ type }: { type: TType }) => {
  const store = createBoardStore(() => {
    const doc = new Y.Doc()
    const awareness = new Awareness(doc)
    // the server only relays: it is not a participant
    awareness.setLocalState(null)
    return { doc, awareness }
  })
  const changes = createTopic<YDocChange>(type)

  const notFound = () => new TRPCError({ code: 'NOT_FOUND', message: `unknown ${type} board` })

  const findBoard = (boardId: string) => {
    const board = store.find(boardId)
    if (!board) throw notFound()
    return board.data
  }

  const applyOrReject = (apply: () => void) => {
    try {
      apply()
    } catch {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'invalid update' })
    }
  }

  return defineServerApp({
    type,
    create: ({ ownerId, roomId }) => {
      const record = store.create({ roomId, owner: ownerId })
      const { doc, awareness } = record.data
      // publishing from the events relays only real changes, including the awareness timeouts (30 s without renewal)
      doc.on('update', (update: Uint8Array) => {
        changes.publish(record.id, { kind: 'update', update: toBase64(update) })
      })
      awareness.on('update', ({ added, updated, removed }: AwarenessChanges) => {
        const clients = [...added, ...updated, ...removed]
        if (clients.length === 0) return
        changes.publish(record.id, { kind: 'awareness', update: toBase64(encodeAwarenessUpdate(awareness, clients)) })
      })
      return record
    },
    remove: ({ boardId, userId }) => {
      const board = store.find(boardId)
      if (board?.owner !== userId) return false
      // stops the awareness timer and drops the listeners
      board.data.awareness.destroy()
      board.data.doc.destroy()
      return store.remove(boardId)
    },
    router: {
      sync: protectedProcedure.input(z.object({ boardId: z.string(), clientId: z.number().int() })).subscription(async function* ({
        input,
        signal
      }): AsyncGenerator<YDocSnapshot | YDocChange> {
        // listen before the first read so that no change can be missed in between
        const pending = changes.listen(input.boardId, signal)
        const board = store.find(input.boardId)
        try {
          if (!board) throw notFound()
          const { doc, awareness } = board.data
          yield {
            kind: 'sync',
            update: toBase64(Y.encodeStateAsUpdate(doc)),
            stateVector: toBase64(Y.encodeStateVector(doc)),
            awareness: toBase64(encodeAwarenessUpdate(awareness, [...awareness.getStates().keys()]))
          }
          for await (const change of pending) yield change
        } catch (err) {
          // the client went away: ending quietly is the expected outcome
          if (signal?.aborted) return
          throw err
        } finally {
          await pending.return?.()
          // its cursor disappears for the others right away, instead of after the awareness timeout
          if (board) removeAwarenessStates(board.data.awareness, [input.clientId], 'disconnect')
        }
      }),

      push: protectedProcedure.input(updateInput).mutation(({ input }) => {
        const { doc } = findBoard(input.boardId)
        applyOrReject(() => Y.applyUpdate(doc, fromBase64(input.update)))
        // what the server now holds: the client sends its next changes relative to it
        return toBase64(Y.encodeStateVector(doc))
      }),

      pushAwareness: protectedProcedure.input(updateInput).mutation(({ input }) => {
        const { awareness } = findBoard(input.boardId)
        applyOrReject(() => applyAwarenessUpdate(awareness, fromBase64(input.update), 'client'))
      })
    }
  })
}
