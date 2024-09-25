import * as authRepo from '@back/repository/auth'
import { findMany as findSessions } from '@back/repository/game'
import * as userRepo from '@back/repository/user'
import { ee, publicProcedure, router } from '@back/services/trpc'
import type { Session } from '@common/model'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'

const REFRESH_SESSIONS_LIST_EVENTS = ['addNewSession', 'deleteSession']

const publicRouter = router({
  getMe: publicProcedure.query(opts => {
    const { ctx } = opts
    return ctx.user
  }),
  userById: publicProcedure.input(z.string()).query(async opts => {
    return await userRepo.findUserById(opts.input)
  }),
  login: publicProcedure.input(z.object({ pseudo: z.string() })).mutation(async opts => {
    return await authRepo.login(opts.input)
  }),
  onGetSessions: publicProcedure.subscription(() => {
    return observable<Session[]>(emit => {
      const onRefreshSessions = async () => {
        const sessions = await findSessions()
        emit.next(sessions)
      }

      for (const eventName of REFRESH_SESSIONS_LIST_EVENTS) {
        ee.on(eventName, onRefreshSessions)
      }
      onRefreshSessions()
      return () => {
        for (const eventName of REFRESH_SESSIONS_LIST_EVENTS) {
          ee.off(eventName, onRefreshSessions)
        }
      }
    })
  })
})

export default publicRouter
