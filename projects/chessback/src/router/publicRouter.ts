import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import * as userRepo from '../repository/user'
import * as authRepo from '../repository/auth'
import * as gameRepo from '../repository/game'
import { ee, publicProcedure, router } from '../services/trpc'
import { findMany as findGames } from '../repository/game'
import type { Game } from 'chesscommon/src/model'

const REFRESH_GAMES_LIST_EVENTS = ['addNewGame', 'deleteGame']
const REFRESH_GAME_EVENTS = ['addWatcher', 'removeWatcher']

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
	onGetGames: publicProcedure.subscription(() => {
		return observable<Game[]>(emit => {
			const onRefreshGames = async () => {
				console.log('refres')
				const games = await findGames()
				emit.next(games)
			}

			for (const eventName of REFRESH_GAMES_LIST_EVENTS) {
				ee.on(eventName, onRefreshGames)
			}
			onRefreshGames()
			return () => {
				for (const eventName of REFRESH_GAMES_LIST_EVENTS) {
					ee.off(eventName, onRefreshGames)
				}
			}
		})
	}),
	// TODO move to protected once websocket auth is ready in trpc https://github.com/trpc/trpc/issues/3955
	watchGame: publicProcedure
		.input(
			z.object({
				gameId: z.string(),
				userId: z.string().optional()
			})
		)
		.subscription(opts => {
			const { gameId, userId } = opts.input

			return observable<Game>(emit => {
				const onRefreshGame = async () => {
					const game = await gameRepo.findGameById(gameId)

					console.log('refresh game')
					game && emit.next(game)
				}

				const addWatcher = async () => {
					if (!userId) {
						emit.error('unknown user')
						return
					}
					const game = await gameRepo.findGameById(gameId)
					if (!game) {
						emit.error('unknown game')
						return
					}

					for (const eventName of REFRESH_GAME_EVENTS) {
						ee.on(eventName, onRefreshGame)
					}

					await gameRepo.addWatcher(gameId, userId)
					console.log('add watcher')
					ee.emit('addWatcher')
				}

				addWatcher()

				return () => {
					const removeWatcher = async () => {
						ee.emit('removeWatcher')
						if (!userId) return
						await gameRepo.removeWatcher(gameId, userId)
					}

					for (const eventName of REFRESH_GAME_EVENTS) {
						ee.off(eventName, onRefreshGame)
					}

					removeWatcher()
				}
			})
		})
})

export default publicRouter
