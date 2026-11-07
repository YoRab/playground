import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { User } from '../model'

export type Context = {
  permissions: string[]
  user: User | null
  /** Whether the user may use this board: the host knows the rooms, their access rules and which board is in which room */
  canAccessBoard: (boardId: string) => boolean | Promise<boolean>
}

/**
 * The single tRPC instance of the backend.
 * `platform` is the only package depending on tRPC: back, front and apps import it from here,
 * which guarantees a single copy at runtime (TRPCError instanceof checks, React context…).
 */
const t = initTRPC.context<Context>().create()

export const router = t.router
export const mergeRouters = t.mergeRouters
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { user: ctx.user } })
})

/**
 * A procedure about one board (`input.boardId`, merged with the input the procedure adds): refused to a user who has no
 * access to the room of the board (private, protected by a password, kicked out). Use it for every procedure of a board.
 *
 * @example move: boardProcedure.input(z.object({ to: z.number() })).mutation(({ ctx, input }) => … input.boardId, input.to)
 */
export const boardProcedure = protectedProcedure.input(z.object({ boardId: z.string() })).use(async ({ ctx, input, next }) => {
  if (!(await ctx.canAccessBoard(input.boardId))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this room' })
  }
  return next()
})

export const withPermissionsProcedure = (permission: string) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.permissions.includes(permission)) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next()
  })

export { TRPCError }
