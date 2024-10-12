import * as chessRepo from '@back/modules/chess/chessRepo'
import * as chessAIRepo from '@back/modules/chess/AI/chessAIRepo'
import { ee, protectedProcedure } from '@back/services/trpc'
import type { ChessGame } from '@common/chess'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import ChessAIRouter from './AI/chessAIRouter'

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
  addPlayer: protectedProcedure
    .input(z.object({ boardId: z.string(), color: z.enum(['white', 'black']), ai: z.string().optional() }))
    .mutation(async opts => {
      const { user } = opts.ctx
      const { boardId, color, ai: aiId } = opts.input

      const game = await chessRepo.findChessById(boardId)
      if (!game) return false

      if (aiId) {
        const ai = await chessAIRepo.findAIById(aiId)
        if (ai?.state !== 'ready') return false
        await chessRepo.addPlayer(boardId, color === 'white' ? 'black' : 'white', ai.id, 'AI')
      }

      const refreshedGame = await chessRepo.addPlayer(boardId, color, user!.id, 'human')
      if (refreshedGame) {
        ee.emit(`refreshChessGame_${boardId}`)
        if (aiId) {
          ee.emit(`refreshAIChessGame_${aiId}`, boardId)
        }
      }
      return refreshedGame
    }),
  giveUp: protectedProcedure.input(z.object({ boardId: z.string() })).mutation(async opts => {
    const { user } = opts.ctx
    const { boardId } = opts.input

    const game = await chessRepo.findChessById(boardId)
    if (!game) return false

    const refreshedGame = await chessRepo.giveUpGame(boardId, user!.id)
    if (refreshedGame) {
      ee.emit(`refreshChessGame_${boardId}`)
      const blackPlayer = game.players.black ?? {}
      const whitePlayer = game.players.white ?? {}
      const aiId =
        'type' in blackPlayer && blackPlayer.type === 'AI'
          ? game.players.black?.id
          : 'type' in whitePlayer && whitePlayer.type === 'AI'
            ? game.players.white?.id
            : undefined
      if (aiId) {
        ee.emit(`refreshAIChessGame_${aiId}`, boardId)
      }
    }
    return refreshedGame
  }),
  movePiece: protectedProcedure
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

      const refreshedGame = await chessRepo.movePiece(boardId, user!.id, 'human', pieceId, newPosition, promotion)
      if (refreshedGame) {
        ee.emit(`refreshChessGame_${boardId}`)
        const blackPlayer = game.players.black ?? {}
        const whitePlayer = game.players.white ?? {}
        const aiId =
          'type' in blackPlayer && blackPlayer.type === 'AI'
            ? game.players.black?.id
            : 'type' in whitePlayer && whitePlayer.type === 'AI'
              ? game.players.white?.id
              : undefined
        if (aiId) {
          ee.emit(`refreshAIChessGame_${aiId}`, boardId)
        }
      }
      return refreshedGame
    }),

  findReadyAIs: protectedProcedure.query(async () => {
    return await chessAIRepo.findReadyAIs()
  })
}

export { ChessAIRouter }
