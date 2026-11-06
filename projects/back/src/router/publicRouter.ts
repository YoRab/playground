import * as authRepo from '@back/repository/auth'
import { findMany as findRooms } from '@back/repository/room'
import * as userRepo from '@back/repository/user'
import { ROOMS_KEY, roomsTopic } from '@back/services/rooms'
import { liveQuery, publicProcedure, router } from '@platform/server'
import { z } from 'zod'

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
  onGetRooms: publicProcedure.subscription(({ signal }) => liveQuery({ topic: roomsTopic, key: ROOMS_KEY, fetch: findRooms, signal }))
})

export default publicRouter
