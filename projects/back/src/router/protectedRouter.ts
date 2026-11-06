import { appTypes, findServerApp } from '@back/apps'
import * as authRepo from '@back/repository/auth'
import * as roomRepo from '@back/repository/room'
import * as userRepo from '@back/repository/user'
import { notifyRooms, roomPresence, roomTopic } from '@back/services/rooms'
import { liveQuery, protectedProcedure, router } from '@platform/server'
import { z } from 'zod'

const protectedRouter = router({
  userList: protectedProcedure.query(async () => {
    return await userRepo.findMany()
  }),

  logout: protectedProcedure.mutation(async () => {
    return authRepo.logout()
  }),

  addNewRoom: protectedProcedure.mutation(async ({ ctx }) => {
    const newRoom = await roomRepo.createRoom(ctx.user.id)
    notifyRooms()
    return newRoom
  }),

  deleteRoom: protectedProcedure.input(z.object({ room: z.string() })).mutation(async ({ ctx, input }) => {
    const hasBeenDeleted = await roomRepo.deleteRoom(input.room, ctx.user.id)
    if (hasBeenDeleted) {
      notifyRooms()
      roomTopic.publish(input.room)
    }
    return hasBeenDeleted
  }),

  watchRoom: protectedProcedure.input(z.object({ roomId: z.string() })).subscription(async function* ({ ctx, input, signal }) {
    const leave = roomPresence.join(input.roomId, ctx.user.id)
    try {
      yield* liveQuery({ topic: roomTopic, key: input.roomId, fetch: () => roomRepo.findRoomById(input.roomId), signal })
    } finally {
      leave()
    }
  }),

  addBoard: protectedProcedure.input(z.object({ type: z.enum(appTypes), roomId: z.string() })).mutation(async ({ ctx, input }) => {
    const { roomId, type } = input

    const room = await roomRepo.findRoomById(roomId)
    if (room?.owner?.id !== ctx.user.id) return

    const newBoard = await findServerApp(type)?.create({ ownerId: ctx.user.id, roomId })
    if (!newBoard) return

    const refreshedRoom = await roomRepo.addBoard(roomId, newBoard.id, ctx.user.id, type)
    roomTopic.publish(roomId)
    return refreshedRoom
  }),

  deleteBoard: protectedProcedure.input(z.object({ roomId: z.string(), boardId: z.string() })).mutation(async ({ ctx, input }) => {
    const { roomId, boardId } = input

    const room = await roomRepo.findRoomById(roomId)
    const board = room?.boards.find(board => board.id === boardId)
    if (!board) return false

    const hasBoardStateBeenDeleted = await findServerApp(board.type)?.remove({ boardId, userId: ctx.user.id })
    if (!hasBoardStateBeenDeleted) return false

    const hasBeenDeleted = await roomRepo.removeBoard(roomId, boardId, ctx.user.id)
    if (hasBeenDeleted) roomTopic.publish(roomId)
    return hasBeenDeleted
  })
})

export default protectedRouter
