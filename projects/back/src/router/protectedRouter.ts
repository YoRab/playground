import { appTypes, findServerApp } from '@back/apps'
import * as authRepo from '@back/repository/auth'
import * as roomRepo from '@back/repository/room'
import * as userRepo from '@back/repository/user'
import { notifyRooms, roomTopic } from '@back/services/rooms'
import { ROOM_LIMITS, ROOM_VISIBILITIES, type RoomView } from '@platform/model'
import { liveQuery, protectedProcedure, router } from '@platform/server'
import { z } from 'zod'

/** The settings chosen when creating a room, and changed by its owner afterwards */
const roomSettingsInput = z.object({
  title: z.string().trim().min(1).max(ROOM_LIMITS.title),
  visibility: z.enum(ROOM_VISIBILITIES),
  maxParticipants: z.number().int().min(ROOM_LIMITS.minParticipants).max(ROOM_LIMITS.maxParticipants),
  /** A new password, for a protected room. Optional when updating a room that already has one. */
  password: z.string().min(ROOM_LIMITS.passwordMin).max(ROOM_LIMITS.passwordMax).optional()
})

const roomUserInput = z.object({ roomId: z.string(), userId: z.string() })

/** Every subscriber of the room re-evaluates its access (kicked out, room gone private…), and the rooms list follows */
const notifyRoom = (roomId: string) => {
  roomTopic.publish(roomId)
  notifyRooms()
}

const protectedRouter = router({
  userList: protectedProcedure.query(async () => {
    return await userRepo.findMany()
  }),

  logout: protectedProcedure.mutation(async () => {
    return authRepo.logout()
  }),

  addNewRoom: protectedProcedure
    .input(roomSettingsInput.refine(settings => settings.visibility !== 'protected' || !!settings.password, 'A protected room needs a password'))
    .mutation(async ({ ctx, input }) => {
      const newRoom = await roomRepo.createRoom(ctx.user.id, input)
      notifyRooms()
      return newRoom
    }),

  updateRoom: protectedProcedure.input(roomSettingsInput.extend({ roomId: z.string() })).mutation(async ({ ctx, input }) => {
    const { roomId, ...settings } = input
    await roomRepo.updateRoom(roomId, ctx.user.id, settings)
    notifyRoom(roomId)
  }),

  /** Enters a protected room with its password: the room subscription of the user then lets them in */
  joinRoom: protectedProcedure
    .input(z.object({ roomId: z.string(), password: z.string().max(ROOM_LIMITS.passwordMax) }))
    .mutation(async ({ ctx, input }) => {
      await roomRepo.joinRoom(input.roomId, ctx.user.id, input.password)
      roomTopic.publish(input.roomId)
    }),

  /** Kicks a user out of the room: banned until the owner lets them in again */
  kickUser: protectedProcedure.input(roomUserInput).mutation(async ({ ctx, input }) => {
    await roomRepo.kickUser(input.roomId, ctx.user.id, input.userId)
    notifyRoom(input.roomId)
  }),

  unbanUser: protectedProcedure.input(roomUserInput).mutation(async ({ ctx, input }) => {
    await roomRepo.unbanUser(input.roomId, ctx.user.id, input.userId)
    notifyRoom(input.roomId)
  }),

  deleteRoom: protectedProcedure.input(z.object({ room: z.string() })).mutation(async ({ ctx, input }) => {
    const hasBeenDeleted = await roomRepo.deleteRoom(input.room, ctx.user.id)
    if (hasBeenDeleted) notifyRoom(input.room)
    return hasBeenDeleted
  }),

  /**
   * The room once the user is in it (joining its presence), or why they are kept out: password, full, private, kicked out.
   * Re-evaluated on every change of the room, so a user is let in (a spot freed up, the password accepted) or kicked out live.
   */
  watchRoom: protectedProcedure.input(z.object({ roomId: z.string() })).subscription(async function* ({
    ctx,
    input,
    signal
  }): AsyncGenerator<RoomView> {
    const session = roomRepo.openRoomSession(input.roomId, ctx.user.id)
    try {
      yield* liveQuery({ topic: roomTopic, key: input.roomId, fetch: session.refresh, signal })
    } finally {
      session.close()
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
