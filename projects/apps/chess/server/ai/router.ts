import { TRPCError, withPermissionsProcedure } from '@platform/server'
import type { ChessGame } from '../../shared/types'
import * as chessRepo from '../repo'
import { moveInput } from '../schemas'
import { aiTurnTopic, gameTopic } from '../topics'
import { PERMISSION_CHESS_IA } from './permissions'
import * as aiRepo from './repo'

const chessAIProcedure = withPermissionsProcedure(PERMISSION_CHESS_IA)

/** Procedures used by the external AI client (mounted as `chessAI`, authenticated with an API key) */
export const chessAIRouter = {
  watchGames: chessAIProcedure.subscription(async function* ({ ctx, signal }): AsyncGenerator<{ type: string; game: ChessGame }> {
    const aiId = ctx.user.id
    console.log(aiId)
    // listen before becoming ready: a game joined right after must not be missed
    const turns = aiTurnTopic.listen(aiId, signal)
    try {
      await aiRepo.startAI(aiId)
      for await (const boardId of turns) {
        const game = await chessRepo.findChessById(boardId)
        if (!game) throw new TRPCError({ code: 'NOT_FOUND', message: 'unknown game' })
        yield { type: 'newMove', game }
      }
    } catch (err) {
      if (!signal?.aborted) throw err
    } finally {
      try {
        await turns.return?.()
      } finally {
        await aiRepo.stopAI(aiId)
      }
    }
  }),

  moveAIPiece: chessAIProcedure.input(moveInput).mutation(async ({ ctx, input }) => {
    const { boardId, pieceId, newPosition, promotion } = input

    const refreshedGame = await chessRepo.movePiece(boardId, ctx.user.id, 'AI', pieceId, newPosition, promotion)
    if (refreshedGame) {
      gameTopic.publish(boardId)
      aiTurnTopic.publish(ctx.user.id, boardId)
    }
    return refreshedGame
  })
}
