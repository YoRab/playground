import { z } from 'zod'
import { ee, protectedProcedure, router } from '@back/services/trpc'
import * as userRepo from '@back/repository/user'
import * as sessionRepo from '@back/repository/game'
import * as authRepo from '@back/repository/auth'
import * as chessRepo from '@back/repository/chess'
import { chessProtectedRouter } from '@back/router/chessRouter'

const protectedRouter = router({
	userList: protectedProcedure.query(async () => {
		return await userRepo.findMany()
	}),

	logout: protectedProcedure.mutation(async () => {
		return authRepo.logout()
	}),

	addNewSession: protectedProcedure.input(z.object({})).mutation(async opts => {
		const { user } = opts.ctx
		const newSession = await sessionRepo.createSession(user!.id)
		ee.emit('addNewSession')
		return newSession
	}),
	deleteSession: protectedProcedure
		.input(
			z.object({
				game: z.string()
			})
		)
		.mutation(async opts => {
			const { user } = opts.ctx
			const { game } = opts.input
			const hasBeenDeleted = await sessionRepo.deleteSession(game, user!.id)
			if (hasBeenDeleted) ee.emit('deleteSession')
			return hasBeenDeleted
		}),
	addBoard: protectedProcedure.input(z.object({ type: z.enum(['chess']), sessionId: z.string() })).mutation(async opts => {
		const { user } = opts.ctx
		const { sessionId, type } = opts.input

		const newGame = type === 'chess' ? await chessRepo.createGame(user!.id, sessionId) : undefined

		if (!newGame) return

		const newSession = await sessionRepo.addBoard(sessionId, newGame.id, user!.id, type)
		ee.emit(`addBoard_${sessionId}`)
		return newSession
	}),
	deleteBoard: protectedProcedure
		.input(
			z.object({
				sessionId: z.string(),
				boardId: z.string()
			})
		)
		.mutation(async opts => {
			const { user } = opts.ctx
			const { sessionId, boardId } = opts.input

			const hasGameBeenDeleted = await chessRepo.deleteGame(boardId, user!.id)
			if (!hasGameBeenDeleted) return false

			const hasBeenDeleted = await sessionRepo.removeBoard(sessionId, boardId, user!.id)
			if (hasBeenDeleted) ee.emit(`removeBoard_${sessionId}`)
			return hasBeenDeleted
		}),
	...chessProtectedRouter
})

export default protectedRouter
