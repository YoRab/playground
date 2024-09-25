import * as chessRepo from '@back/repository/chess'
import { ee, protectedProcedure } from '@back/services/trpc'
import type { ChessGame } from '@common/chess'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'

const REFRESH_GAME_EVENTS = ['refreshChessGame']

export const chessRouter = {
  watchChessGame: protectedProcedure
    .input(
      z.object({
        boardId: z.string()
      })
    )
    .subscription(async opts => {
      const { boardId } = opts.input
      const game = await chessRepo.findChessById(boardId)

      return observable<ChessGame>(emit => {
        const onRefreshGame = async () => {
          const refreshedGame = await chessRepo.findChessById(boardId)
          refreshedGame && emit.next(refreshedGame)
        }

        if (!game) {
          emit.error('unknown game')
          return
        }

        const events = REFRESH_GAME_EVENTS.map(eventName => `${eventName}_${boardId}`)

        for (const eventName of events) {
          ee.on(eventName, onRefreshGame)
        }
        onRefreshGame()

        return () => {
          for (const eventName of events) {
            ee.off(eventName, onRefreshGame)
          }
        }
      })
    }),
  addPlayer: protectedProcedure.input(z.object({ boardId: z.string(), color: z.enum(['white', 'black']) })).mutation(async opts => {
    const { user } = opts.ctx
    const { boardId, color } = opts.input

    const game = await chessRepo.findChessById(boardId)
    if (!game) return false

    const refreshedGame = await chessRepo.addPlayer(boardId, color, user!.id)
    if (refreshedGame) ee.emit(`refreshChessGame_${boardId}`)
    return refreshedGame
  }),
  movePiece: protectedProcedure
    .input(z.object({ boardId: z.string(), pieceId: z.string(), newPosition: z.tuple([z.number(), z.number()]) }))
    .mutation(async opts => {
      const { user } = opts.ctx
      const { boardId, pieceId, newPosition } = opts.input

      const game = await chessRepo.findChessById(boardId)
      if (!game) return false

      const refreshedGame = await chessRepo.movePiece(boardId, user!.id, pieceId, newPosition)
      if (refreshedGame) ee.emit(`refreshChessGame_${boardId}`)
      return refreshedGame
    })
}
