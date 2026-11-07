import { boardProcedure } from '@platform/server'
import { BOT_LEVELS, DENSITY, DIAGONALS, GRID_PRESET_KEYS, SEAT_COUNT } from '@yorab/mine.io/engine'
import { z } from 'zod'
import * as repo from './repo'
import { boardTopic } from './store'
import type { MineMessage } from './types'

// `boardProcedure` adds `boardId` to these inputs
const seatInput = z.object({
  seat: z
    .number()
    .int()
    .min(0)
    .max(SEAT_COUNT - 1)
})
const botLevel = z.enum(BOT_LEVELS)

export const mineioRouter = {
  /** The board: a snapshot, then the events of the game, the hovers, and a new snapshot on every change of the lobby */
  sync: boardProcedure
    // `attempt` only makes a client's new subscription differ from the previous one (after a gap in the events)
    .input(z.object({ attempt: z.number().int().optional() }))
    .subscription(async function* ({ input, signal }): AsyncGenerator<MineMessage> {
      // listen before the first read so that no change can be missed in between
      const pending = boardTopic.listen(input.boardId, signal)
      try {
        yield repo.boardSnapshot(input.boardId)
        for await (const message of pending) yield message
      } catch (err) {
        // the client went away: ending quietly is the expected outcome
        if (signal?.aborted) return
        throw err
      } finally {
        await pending.return?.()
      }
    }),

  takeSeat: boardProcedure.input(seatInput).mutation(({ ctx, input }) => repo.takeSeat(input.boardId, ctx.user.id, input.seat)),

  leaveSeat: boardProcedure.mutation(({ ctx, input }) => repo.leaveSeat(input.boardId, ctx.user.id)),

  addBot: boardProcedure
    .input(seatInput.extend({ level: botLevel }))
    .mutation(({ ctx, input }) => repo.addBot(input.boardId, ctx.user.id, input.seat, input.level)),

  removeBot: boardProcedure.input(seatInput).mutation(({ ctx, input }) => repo.removeBot(input.boardId, ctx.user.id, input.seat)),

  updateSettings: boardProcedure
    .input(
      z.object({
        preset: z.enum(GRID_PRESET_KEYS).optional(),
        density: z.number().min(DENSITY.min).max(DENSITY.max).optional(),
        diagonals: z.enum(DIAGONALS).optional(),
        chording: z.boolean().optional()
      })
    )
    .mutation(({ ctx, input }) => {
      const { boardId, ...settings } = input
      repo.updateSettings(boardId, ctx.user.id, settings)
    }),

  start: boardProcedure.mutation(({ ctx, input }) => repo.startGame(input.boardId, ctx.user.id)),

  backToLobby: boardProcedure.mutation(({ ctx, input }) => repo.backToLobby(input.boardId, ctx.user.id)),

  /** `{ ok: false, reason }` for a move the rules refuse (taken meanwhile, stunned…): not an error */
  reveal: boardProcedure
    .input(z.object({ cell: z.number().int().min(0) }))
    .mutation(({ ctx, input }) => repo.reveal(input.boardId, ctx.user.id, input.cell)),

  hover: boardProcedure
    .input(z.object({ cell: z.number().int().min(0).nullable() }))
    .mutation(({ ctx, input }) => repo.hover(input.boardId, ctx.user.id, input.cell))
}
