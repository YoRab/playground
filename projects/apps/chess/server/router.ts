import { liveQuery, protectedProcedure } from '@platform/server'
import { z } from 'zod'
import * as aiRepo from './ai/repo'
import * as chessRepo from './repo'
import { boardInput, moveInput } from './schemas'
import { gameTopic, notifyAIPlayer } from './topics'

export const chessRouter = {
  watchChessGame: protectedProcedure
    .input(boardInput)
    .subscription(({ input, signal }) =>
      liveQuery({ topic: gameTopic, key: input.boardId, fetch: () => chessRepo.findChessById(input.boardId), signal })
    ),

  addPlayer: protectedProcedure
    .input(z.object({ boardId: z.string(), color: z.enum(['white', 'black']), ai: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { boardId, color, ai: aiId } = input

      const game = await chessRepo.findChessById(boardId)
      if (!game) return false

      if (aiId) {
        const ai = await aiRepo.findAIById(aiId)
        if (ai?.state !== 'ready') return false
        await chessRepo.addPlayer(boardId, color === 'white' ? 'black' : 'white', ai.id, 'AI')
      }

      const refreshedGame = await chessRepo.addPlayer(boardId, color, ctx.user.id, 'human')
      if (refreshedGame) {
        gameTopic.publish(boardId)
        notifyAIPlayer(refreshedGame)
      }
      return refreshedGame
    }),

  giveUp: protectedProcedure.input(boardInput).mutation(async ({ ctx, input }) => {
    const { boardId } = input

    const game = await chessRepo.findChessById(boardId)
    if (!game) return false

    const hasGivenUp = await chessRepo.giveUpGame(boardId, ctx.user.id)
    if (hasGivenUp) {
      gameTopic.publish(boardId)
      notifyAIPlayer(game)
    }
    return hasGivenUp
  }),

  movePiece: protectedProcedure.input(moveInput).mutation(async ({ ctx, input }) => {
    const { boardId, pieceId, newPosition, promotion } = input

    const refreshedGame = await chessRepo.movePiece(boardId, ctx.user.id, 'human', pieceId, newPosition, promotion)
    if (refreshedGame) {
      gameTopic.publish(boardId)
      notifyAIPlayer(refreshedGame)
    }
    return refreshedGame
  }),

  findReadyAIs: protectedProcedure.query(async () => {
    return await aiRepo.findReadyAIs()
  })
}
