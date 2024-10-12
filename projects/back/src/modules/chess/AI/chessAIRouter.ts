import { PERMISSION_CHESS_IA } from '@back/constants/permissions'
import * as chessRepo from '@back/modules/chess/chessRepo'
import * as chessAIRepo from '@back/modules/chess/AI/chessAIRepo'
import { ee, withPermissionsProcedure } from '@back/services/trpc'
import type { ChessGame } from '@common/chess'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'

const REFRESH_IA_GAME_EVENTS = ['refreshAIChessGame']

const chessAIProcedure = withPermissionsProcedure(PERMISSION_CHESS_IA)

const chessAIRouter = {
  watchGames: chessAIProcedure.subscription(async opts => {
    const { user } = opts.ctx

    return observable<{ type: string; game: ChessGame }>(emit => {
      const updateState = async (state: 'start' | 'stop') => {
        state === 'start' ? await chessAIRepo.startAI(user!.id) : await chessAIRepo.stopAI(user!.id)
      }

      const onRefreshGame = async (gameId: string) => {
        const refreshedGame = await chessRepo.findChessById(gameId)
        if (!refreshedGame) {
          emit.error('unknown game')
          return
        }
        refreshedGame && emit.next({ type: 'newMove', game: refreshedGame })
      }

      const events = REFRESH_IA_GAME_EVENTS.map(eventName => `${eventName}_${user!.id}`)

      for (const eventName of events) {
        ee.on(eventName, onRefreshGame)
      }
      updateState('start')

      return () => {
        for (const eventName of events) {
          ee.off(eventName, onRefreshGame)
        }
        updateState('stop')
      }
    })
  }),
  moveAIPiece: chessAIProcedure
    .input(
      z.object({
        boardId: z.string(),
        pieceId: z.string(),
        newPosition: z.tuple([z.number(), z.number()]),
        promotion: z.enum(['queen', 'rook', 'bishop', 'knight']).optional()
      })
    )
    .mutation(async opts => {
      const { user } = opts.ctx
      const { boardId, pieceId, newPosition, promotion } = opts.input

      const game = await chessRepo.findChessById(boardId)
      if (!game) return false

      const refreshedGame = await chessRepo.movePiece(boardId, user!.id, 'AI', pieceId, newPosition, promotion)
      if (refreshedGame) {
        ee.emit(`refreshChessGame_${boardId}`)
        ee.emit(`refreshAIChessGame_${user!.id}`, boardId)
      }
      return refreshedGame
    })
}

export default chessAIRouter
