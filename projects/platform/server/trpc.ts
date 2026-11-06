import { initTRPC, TRPCError } from '@trpc/server'
import type { User } from '../model'

export type Context = {
  permissions: string[]
  user: User | null
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

export const withPermissionsProcedure = (permission: string) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.permissions.includes(permission)) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next()
  })

export { TRPCError }
