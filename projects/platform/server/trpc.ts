import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { ErrorI18n, User } from '../model'

export type Context = {
  permissions: string[]
  user: User | null
  /** Whether the user may use this board: the host knows the rooms, their access rules and which board is in which room */
  canAccessBoard: (boardId: string) => boolean | Promise<boolean>
}

/** A TRPCError that the client can show in its user's language (`errorMessage` of `@platform/client`) */
class I18nError extends TRPCError {
  readonly i18n: ErrorI18n

  constructor(code: TRPCError['code'], i18n: ErrorI18n, message: string) {
    super({ code, message })
    this.i18n = i18n
  }
}

/**
 * An error whose message the client translates: `key` (`<namespace>:<key>`) names it in the dictionaries of the client,
 * `message` (English) is for the logs and the external clients, and the fallback when the client has no translation.
 *
 * @example throw i18nError('BAD_REQUEST', 'mineio:errors.cornerTaken', 'This corner is taken')
 */
export const i18nError = (code: TRPCError['code'], key: string, message: string, params?: ErrorI18n['params']) =>
  new I18nError(code, params ? { key, params } : { key }, message)

/**
 * The single tRPC instance of the backend.
 * `platform` is the only package depending on tRPC: back, front and apps import it from here,
 * which guarantees a single copy at runtime (TRPCError instanceof checks, React context…).
 */
const t = initTRPC.context<Context>().create({
  // the key of an `i18nError` reaches the client in `error.data.i18n` (queries, mutations and subscriptions alike)
  errorFormatter: ({ shape, error }) => ({ ...shape, data: { ...shape.data, i18n: error instanceof I18nError ? error.i18n : null } })
})

export const router = t.router
export const mergeRouters = t.mergeRouters
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw i18nError('UNAUTHORIZED', 'platform:errors.unauthorized', 'You are not logged in')
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
    throw i18nError('FORBIDDEN', 'platform:errors.noAccess', 'You do not have access to this room')
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
