import * as authRepo from '@back/repository/auth'
import * as chessRepo from '@back/modules/chess/chessRepo'
import * as roomRepo from '@back/repository/room'
import * as paintRepo from '@back/modules/paint/paintRepo'
import * as userRepo from '@back/repository/user'
import * as wordRepo from '@back/modules/word/wordRepo'
import { ee, protectedProcedure, router } from '@back/services/trpc'
import type { Room } from '@common/model'
import { observable } from '@trpc/server/observable'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const REFRESH_SESSION_EVENTS = ['addWatcher', 'removeWatcher', 'addBoard', 'removeBoard']

const protectedRouter = router({
  userList: protectedProcedure.query(async () => {
    return await userRepo.findMany()
  }),

  logout: protectedProcedure.mutation(async () => {
    return authRepo.logout()
  }),

  addNewRoom: protectedProcedure.mutation(async opts => {
    const { user } = opts.ctx
    const newSession = await roomRepo.createRoom(user!.id)
    ee.emit('addNewRoom')
    return newSession
  }),
  deleteRoom: protectedProcedure
    .input(
      z.object({
        room: z.string()
      })
    )
    .mutation(async opts => {
      const { user } = opts.ctx
      const { room: game } = opts.input
      const hasBeenDeleted = await roomRepo.deleteRoom(game, user!.id)
      if (hasBeenDeleted) ee.emit('deleteRoom')
      return hasBeenDeleted
    }),
  watchRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string()
      })
    )
    .subscription(async opts => {
      const { user } = opts.ctx
      const { roomId } = opts.input
      const room = await roomRepo.findRoomById(roomId)

      const subTempId = uuidv4()

      return observable<Room>(emit => {
        const onRefreshRoom = async () => {
          const refreshedRoom = await roomRepo.findRoomById(roomId)
          refreshedRoom && emit.next(refreshedRoom)
        }

        const events = REFRESH_SESSION_EVENTS.map(eventName => `${eventName}_${roomId}`)

        const userId = user?.id

        if (!userId) {
          emit.error('unknown user')
          return
        }
        if (!room) {
          emit.error('unknown room')
          return
        }

        const addWatcher = async () => {
          await roomRepo.addWatcher(roomId, subTempId, userId!)
          ee.emit(`addWatcher_${roomId}`)
        }

        for (const eventName of events) {
          ee.on(eventName, onRefreshRoom)
        }

        addWatcher()

        return () => {
          const removeWatcher = async () => {
            await roomRepo.removeWatcher(roomId, subTempId)
            ee.emit(`removeWatcher_${roomId}`)
          }

          for (const eventName of events) {
            ee.off(eventName, onRefreshRoom)
          }

          removeWatcher()
        }
      })
    }),
  addBoard: protectedProcedure.input(z.object({ type: z.enum(['chess', 'reactPaint', 'word']), roomId: z.string() })).mutation(async opts => {
    const { user } = opts.ctx
    const { roomId, type } = opts.input

    const newGame =
      type === 'chess'
        ? await chessRepo.createGame(user!.id, roomId)
        : type === 'reactPaint'
          ? await paintRepo.createReactPaint(user!.id, roomId)
          : type === 'word'
            ? await wordRepo.createWord(user!.id, roomId)
            : undefined

    if (!newGame) return

    const newBoard = await roomRepo.addBoard(roomId, newGame.id, user!.id, type)
    ee.emit(`addBoard_${roomId}`)
    return newBoard
  }),
  deleteBoard: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        boardId: z.string()
      })
    )
    .mutation(async opts => {
      const { user } = opts.ctx
      const { roomId, boardId } = opts.input
      const room = await roomRepo.findRoomById(roomId)
      if (!room) return false

      const board = room.boards.find(board => board.id === boardId)
      if (!board) return false

      const hasGameBeenDeleted =
        board.type === 'chess'
          ? await chessRepo.deleteGame(boardId, user!.id)
          : board.type === 'reactPaint'
            ? await paintRepo.deleteReactPaint(boardId, user!.id)
            : board.type === 'word'
              ? await wordRepo.deleteWord(boardId, user!.id)
              : undefined
      if (!hasGameBeenDeleted) return false

      const hasBeenDeleted = await roomRepo.removeBoard(roomId, boardId, user!.id)
      if (hasBeenDeleted) ee.emit(`removeBoard_${roomId}`)
      return hasBeenDeleted
    })
})

export default protectedRouter
