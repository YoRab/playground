import * as authRepo from '@back/repository/auth'
import { findMany as findRooms } from '@back/repository/room'
import * as userRepo from '@back/repository/user'
import { ee, publicProcedure, router } from '@back/services/trpc'
import type { Room } from '@common/model'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'

const REFRESH_ROOMS_LIST_EVENTS = ['addNewRoom', 'deleteRoom']

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
  onGetRooms: publicProcedure.subscription(() => {
    return observable<Room[]>(emit => {
      const onRefreshRooms = async () => {
        const rooms = await findRooms()
        emit.next(rooms)
      }

      for (const eventName of REFRESH_ROOMS_LIST_EVENTS) {
        ee.on(eventName, onRefreshRooms)
      }
      onRefreshRooms()
      return () => {
        for (const eventName of REFRESH_ROOMS_LIST_EVENTS) {
          ee.off(eventName, onRefreshRooms)
        }
      }
    })
  })
})

export default publicRouter
