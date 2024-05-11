import { z } from 'zod'
import { ee, publicProcedure, protectedProcedure } from '@back/services/trpc'
import { observable } from '@trpc/server/observable'
import { ChessGame } from '@common/chess'
import * as chessRepo from '@back/repository/chess'

const REFRESH_GAME_EVENTS = ['refreshChessGame']

export const chessPublicRouter = {
	watchChessGame: publicProcedure
		.input(
			z.object({
				gameId: z.string()
			})
		)
		.subscription(async opts => {
			const { gameId } = opts.input
			const game = await chessRepo.findChessById(gameId)

			return observable<ChessGame>(emit => {
				const onRefreshGame = async () => {
					const refreshedGame = await chessRepo.findChessById(gameId)
					refreshedGame && emit.next(refreshedGame)
				}

				if (!game) {
					emit.error('unknown game')
					return
				}

				const events = REFRESH_GAME_EVENTS.map(eventName => `${eventName}_${gameId}`)

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
		})
}

export const chessProtectedRouter = {
	startGame: protectedProcedure.input(z.object({ gameId: z.string() })).mutation(async opts => {
		const { user } = opts.ctx
		const { gameId } = opts.input

		const hasStarted = await chessRepo.startGame(gameId, user!.id)
		if (hasStarted) ee.emit(`refreshChessGame_${gameId}`)
		return hasStarted
	}),
	addPlayer: protectedProcedure.input(z.object({ gameId: z.string() })).mutation(async opts => {
		const { user } = opts.ctx
		const { gameId } = opts.input

		const game = await chessRepo.findChessById(gameId)
		if (!game) return false

		const color = game.players.white === undefined ? 'white' : 'black'
		const refreshedGame = await chessRepo.addPlayer(gameId, color, user!.id)
		if (refreshedGame) ee.emit(`refreshChessGame_${gameId}`)
		return refreshedGame
	}),
	movePiece: protectedProcedure
		.input(z.object({ gameId: z.string(), pieceId: z.string(), newPosition: z.tuple([z.number(), z.number()]) }))
		.mutation(async opts => {
			const { user } = opts.ctx
			const { gameId, pieceId, newPosition } = opts.input

			const game = await chessRepo.findChessById(gameId)
			if (!game) return false

			const refreshedGame = await chessRepo.movePiece(gameId, user!.id, pieceId, newPosition)
			if (refreshedGame) ee.emit(`refreshChessGame_${gameId}`)
			return refreshedGame
		})
}
