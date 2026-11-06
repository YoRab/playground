import { z } from 'zod'
import { createBoardStore } from './boardStore'
import { defineServerApp } from './defineApp'
import { createTopic, liveQuery } from './realtime'
import { protectedProcedure, TRPCError } from './trpc'

/**
 * Server side of an app whose board is one shared value (last write wins):
 * generates the board lifecycle and two procedures, `watch({ boardId })` and `set({ boardId, value })`.
 *
 * @example defineSharedStateApp({ type: 'paint', schema: z.array(z.unknown()), initial: () => [] })
 */
export const defineSharedStateApp = <const TType extends string, TSchema extends z.ZodType>({
  type,
  schema,
  initial
}: {
  type: TType
  /** Validates the value sent by the clients (and types it on both sides) */
  schema: TSchema
  initial: () => z.output<TSchema>
}) => {
  type TValue = z.output<TSchema>
  const store = createBoardStore<TValue>(initial)
  const changes = createTopic(type)

  // zod cannot compute the type of an object holding a generic schema: state it explicitly
  const setInput = z.object({ boardId: z.string(), value: schema }) as unknown as z.ZodType<
    { boardId: string; value: TValue },
    { boardId: string; value: z.input<TSchema> }
  >

  return defineServerApp({
    type,
    create: ({ ownerId, roomId }) => store.create({ roomId, owner: ownerId }),
    remove: ({ boardId, userId }) => {
      if (store.find(boardId)?.owner !== userId) return false
      return store.remove(boardId)
    },
    router: {
      watch: protectedProcedure
        .input(z.object({ boardId: z.string() }))
        .subscription(({ input, signal }) => liveQuery({ topic: changes, key: input.boardId, fetch: () => store.find(input.boardId), signal })),

      set: protectedProcedure.input(setInput).mutation(({ input }) => {
        const updated = store.update(input.boardId, () => input.value)
        if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: `unknown ${type} board` })
        changes.publish(input.boardId)
        return updated
      })
    }
  })
}
