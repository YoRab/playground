import { z } from 'zod'
import { ee, protectedProcedure, router } from '@back/services/trpc'
import * as userRepo from '@back/repository/user'
import * as sessionRepo from '@back/repository/game'
import * as authRepo from '@back/repository/auth'
import * as chessRepo from '@back/repository/chess'
import * as paintRepo from '@back/repository/reactPaint'
import * as wordRepo from '@back/repository/word'
import { chessRouter } from '@back/router/chessRouter'
import { v4 as uuidv4 } from 'uuid'
import type { Session } from '@common/model'
import { observable } from '@trpc/server/observable'
import wordRouter from '@back/router/wordRouter'
import reactPaintRouter from '@back/router/reactPaintRouter'

const REFRESH_SESSION_EVENTS = ['addWatcher', 'removeWatcher', 'addBoard', 'removeBoard']

const protectedRouter = router({
	userList: protectedProcedure.query(async () => {
		return await userRepo.findMany()
	}),

	logout: protectedProcedure.mutation(async () => {
		return authRepo.logout()
	}),

	addNewSession: protectedProcedure.mutation(async opts => {
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
	watchSession: protectedProcedure
		.input(
			z.object({
				sessionId: z.string()
			})
		)
		.subscription(async opts => {
			const { user } = opts.ctx
			const { sessionId } = opts.input
			const session = await sessionRepo.findSessionById(sessionId)

			const subTempId = uuidv4()

			return observable<Session>(emit => {
				const onRefreshSession = async () => {
					console.log('refreh session')
					const refreshedSession = await sessionRepo.findSessionById(sessionId)
					refreshedSession && emit.next(refreshedSession)
				}

				const events = REFRESH_SESSION_EVENTS.map(eventName => `${eventName}_${sessionId}`)

				const userId = user?.id

				if (!userId) {
					emit.error('unknown user')
					return
				}
				if (!session) {
					emit.error('unknown session')
					return
				}

				const addWatcher = async () => {
					await sessionRepo.addWatcher(sessionId, subTempId, userId!)
					ee.emit(`addWatcher_${sessionId}`)
				}

				for (const eventName of events) {
					ee.on(eventName, onRefreshSession)
				}

				addWatcher()

				return () => {
					const removeWatcher = async () => {
						await sessionRepo.removeWatcher(sessionId, subTempId)
						ee.emit(`removeWatcher_${sessionId}`)
					}

					for (const eventName of events) {
						ee.off(eventName, onRefreshSession)
					}

					removeWatcher()
				}
			})
		}),
	addBoard: protectedProcedure.input(z.object({ type: z.enum(['chess', 'reactPaint', 'word']), sessionId: z.string() })).mutation(async opts => {
		const { user } = opts.ctx
		const { sessionId, type } = opts.input

		const newGame =
			type === 'chess'
				? await chessRepo.createGame(user!.id, sessionId)
				: type === 'reactPaint'
				  ? await paintRepo.createReactPaint(user!.id, sessionId)
				  : type === 'word'
					  ? await wordRepo.createWord(user!.id, sessionId)
					  : undefined

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
			const session = await sessionRepo.findSessionById(sessionId)
			if (!session) return false

			const board = session.boards.find(board => board.id === boardId)
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

			const hasBeenDeleted = await sessionRepo.removeBoard(sessionId, boardId, user!.id)
			if (hasBeenDeleted) ee.emit(`removeBoard_${sessionId}`)
			return hasBeenDeleted
		}),
	...chessRouter,
	...wordRouter,
	...reactPaintRouter
})

export default protectedRouter
