import { EventEmitter } from 'node:events'
import { TRPCError, initTRPC } from '@trpc/server'
import type { Context } from './context'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create()

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure

const isAuthed = t.middleware(opts => {
  const { ctx } = opts
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next()
})
export const protectedProcedure = t.procedure.use(isAuthed)

const hasPermission = (permission: string) =>
  t.middleware(opts => {
    const { ctx } = opts
    if (!ctx.permissions?.includes(permission)) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return opts.next()
  })

export const withPermissionsProcedure = (permToCheck: string) => t.procedure.use(hasPermission(permToCheck))

export const ee = new EventEmitter()
