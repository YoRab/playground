import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import * as userRepo from '../repository/user'
import * as authRepo from '../repository/auth'
import * as gameRepo from '../repository/game'
import { ee, publicProcedure, router } from '../services/trpc'
import { findMany as findGames } from '../repository/game'
import type { Game } from 'chesscommon/src/model'
import { v4 as uuidv4 } from 'uuid'

const REFRESH_GAMES_LIST_EVENTS = ['addNewGame', 'deleteGame']
const REFRESH_GAME_EVENTS = ['addWatcher', 'removeWatcher']
const REFRESH_WORD_EVENTS = ['refreshWord']
const REFRESH_REACT_PAINT = ['refreshReactPaint']

let WORD = ''
let REACTPAINT_DATA: unknown = {}
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
		.subscription(async opts => {
			const { gameId, userId } = opts.input
			const game = await gameRepo.findGameById(gameId)

			const subTempId = uuidv4()

			return observable<Game>(emit => {
				const onRefreshGame = async () => {
					console.log('refresh game')
					emit.next(game!)
				}

				const addWatcher = async () => {
					console.log('addwatcher ', subTempId)

					for (const eventName of REFRESH_GAME_EVENTS) {
						ee.on(eventName, onRefreshGame)
					}

					await gameRepo.addWatcher(gameId, subTempId, userId!)
					ee.emit('addWatcher')
				}

				if (!userId) {
					emit.error('unknown user')
					return
				}
				if (!game) {
					emit.error('unknown game')
					return
				}
				addWatcher()

				return () => {
					const removeWatcher = async () => {
						console.log('remove watcher ', subTempId)
						await gameRepo.removeWatcher(gameId, subTempId)
						ee.emit('removeWatcher')
					}

					for (const eventName of REFRESH_GAME_EVENTS) {
						ee.off(eventName, onRefreshGame)
					}

					removeWatcher()
				}
			})
		}),

	setWord: publicProcedure.input(z.object({ value: z.string() })).mutation(async opts => {
		WORD = opts.input.value
		ee.emit('refreshWord')
		return true
	}),
	onGetWord: publicProcedure.subscription(() => {
		return observable<string>(emit => {
			const onRefreshWord = async () => {
				console.log('onRefreshWord')
				emit.next(WORD)
			}

			for (const eventName of REFRESH_WORD_EVENTS) {
				ee.on(eventName, onRefreshWord)
			}
			onRefreshWord()
			return () => {
				for (const eventName of REFRESH_WORD_EVENTS) {
					ee.off(eventName, onRefreshWord)
				}
			}
		})
	}),

	setPaint: publicProcedure.input(z.object({ value: z.unknown() })).mutation(async opts => {
		REACTPAINT_DATA = opts.input.value
		ee.emit('refreshReactPaint')
		return true
	}),
	onGetPaint: publicProcedure.subscription(() => {
		return observable<unknown>(emit => {
			const onRefreshPaint = async () => {
				console.log('onGetPaint')
				emit.next(REACTPAINT_DATA)
			}

			for (const eventName of REFRESH_REACT_PAINT) {
				ee.on(eventName, onRefreshPaint)
			}
			onRefreshPaint()
			return () => {
				for (const eventName of REFRESH_REACT_PAINT) {
					ee.off(eventName, onRefreshPaint)
				}
			}
		})
	})
})

export default publicRouter
