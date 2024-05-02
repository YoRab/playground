import { z } from 'zod'
import { observable } from '@trpc/server/observable'
import { ee, protectedProcedure, router } from '../services/trpc'
import * as userRepo from '../repository/user'
import * as gameRepo from '../repository/game'
import * as authRepo from '../repository/auth'

const protectedRouter = router({
	userList: protectedProcedure.query(async () => {
		return await userRepo.findMany()
	}),

	logout: protectedProcedure.mutation(async () => {
		return authRepo.logout()
	}),

	addNewGame: protectedProcedure.input(z.object({})).mutation(async opts => {
		const { user } = opts.ctx
		const newGame = await gameRepo.createGame(user!.id)
		ee.emit('addNewGame')
		return newGame
	}),
	deleteGame: protectedProcedure
		.input(
			z.object({
				game: z.string()
			})
		)
		.mutation(async opts => {
			const { user } = opts.ctx
			const { game } = opts.input
			const hasBeenDeleted = await gameRepo.deleteGame(game, user!.id)
			if (hasBeenDeleted) ee.emit('deleteGame')
			return hasBeenDeleted
		})

	// watchGame: protectedProcedure
	// 	.input(
	// 		z.object({
	// 			game: z.string(),
	// 			//type: z.enum(["watcher" || "player"]),
	// 		}),
	// 	)
	// 	.mutation(async (opts) => {
	// 		const { user } = opts.ctx;
	// 		const { game } = opts.input;
	// 		// biome-ignore lint/style/noNonNullAssertion: <explanation>
	// 		const newGame = await gameRepo.addWatcher(game, user!.id);
	// 		if (!newGame) return;

	// 		ee.emit("watchGame");
	// 		return newGame;
	// 	}),

	// unWatchGame: protectedProcedure
	// 	.input(
	// 		z.object({
	// 			game: z.string(),
	// 		}),
	// 	)
	// 	.mutation(async (opts) => {
	// 		const { user } = opts.ctx;

	// 		const { game } = opts.input;
	// 		// biome-ignore lint/style/noNonNullAssertion: <explanation>
	// 		const newGame = await gameRepo.removeWatcher(game, user!.id);
	// 		if (!newGame) return;

	// 		ee.emit("unWatchGame");
	// 		return newGame;
	// 	}),
})

export default protectedRouter
