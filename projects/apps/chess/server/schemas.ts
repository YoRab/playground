import { z } from 'zod'
import { PROMOTIONS } from '../shared/types'

export const boardInput = z.object({ boardId: z.string() })

/** A move, played by a human (`chess.movePiece`) or by an AI client (`chessAI.moveAIPiece`) */
export const moveInput = boardInput.extend({
  pieceId: z.string(),
  newPosition: z.tuple([z.number(), z.number()]),
  promotion: z.enum(PROMOTIONS).optional()
})
