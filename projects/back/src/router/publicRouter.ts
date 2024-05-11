import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import * as userRepo from '@back/repository/user'
import * as authRepo from '@back/repository/auth'
import * as sessionRepo from '@back/repository/game'
import { ee, publicProcedure, router } from '@back/services/trpc'
import { findMany as findSessions } from '@back/repository/game'
import type { Session } from '@common/model'
import { v4 as uuidv4 } from 'uuid'
import wordRouter from '@back/router/wordRouter'
import reactPaintRouter from '@back/router/reactPaintRouter'
import { chessPublicRouter } from '@back/router/chessRouter'

const REFRESH_SESSIONS_LIST_EVENTS = ['addNewSession', 'deleteSession']
const REFRESH_SESSION_EVENTS = ['addWatcher', 'removeWatcher', 'addBoard', 'removeBoard']

const publicRouter = router({
	getMe: publicProcedure.query(opts => {
		const { ctx } = opts
		return ctx.user
	}),
	userById: publicProcedure.input(z.string()).query(async opts => {
		return await userRepo.findUserById(opts.input)
	}),
	login: publicProcedure.input(z.object({ pseudo: z.string() })).mutation(async opts => {
		return await authRepo.login(opts.input)
	}),
	onGetSessions: publicProcedure.subscription(() => {
		return observable<Session[]>(emit => {
			const onRefreshSessions = async () => {
				const sessions = await findSessions()
				emit.next(sessions)
			}

			for (const eventName of REFRESH_SESSIONS_LIST_EVENTS) {
				ee.on(eventName, onRefreshSessions)
			}
			onRefreshSessions()
			return () => {
				for (const eventName of REFRESH_SESSIONS_LIST_EVENTS) {
					ee.off(eventName, onRefreshSessions)
				}
			}
		})
	}),
	// TODO move to protected once websocket auth is ready in trpc https://github.com/trpc/trpc/issues/3955
	watchSession: publicProcedure
		.input(
			z.object({
				sessionId: z.string(),
				userId: z.string().optional()
			})
		)
		.subscription(async opts => {
			const { sessionId, userId } = opts.input
			const session = await sessionRepo.findSessionById(sessionId)

			const subTempId = uuidv4()

			return observable<Session>(emit => {
				const onRefreshSession = async () => {
					console.log('refreh session')
					const refreshedSession = await sessionRepo.findSessionById(sessionId)
					refreshedSession && emit.next(refreshedSession)
				}

				const events = REFRESH_SESSION_EVENTS.map(eventName => `${eventName}_${sessionId}`)

				const addWatcher = async () => {
					await sessionRepo.addWatcher(sessionId, subTempId, userId!)
					ee.emit(`addWatcher_${sessionId}`)
				}

				if (!userId) {
					emit.error('unknown user')
					return
				}
				if (!session) {
					emit.error('unknown session')
					return
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
	...wordRouter,
	...reactPaintRouter,
	...chessPublicRouter
})

export default publicRouter
