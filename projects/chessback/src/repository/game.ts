import gameApi, { DBGame } from '../api/game'
import userApi from '../api/user'
import type { Game } from '../../../chesscommon/src/model'

const resolveUsers = async (game?: DBGame): Promise<Game | undefined> => {
	if (game === undefined) return undefined

	const owner = await userApi.findById(game.owner)
	const users = (await Promise.all(game.players.map(async user => (user ? await userApi.findById(user) : undefined)))).filter(
		user => !!user
	) as Game['players']

	const watchers = (await Promise.all(game.watchers.map(async ([socketId, userId]) => await userApi.findById(userId)))).filter(
		(user, index, array) => !!user && array.indexOf(user) === index
	) as Game['watchers']
	console.log(watchers)
	return {
		...game,
		owner,
		players: users,
		watchers
	}
}

export const findMany = async (): Promise<Game[]> => {
	const games = await gameApi.findMany()
	const promises = games.map(async game => (await resolveUsers(game))!)
	return Promise.all(promises)
}

export const findGameById = async (id: string): Promise<Game | undefined> => {
	const game = await gameApi.findById(id)
	return resolveUsers(game)
}

export const createGame = async (owner: string): Promise<Game | undefined> => {
	const userFound = await userApi.findById(owner)
	if (!userFound) {
		return
	}
	const game = await gameApi.create({ owner })
	return resolveUsers(game)
}

export const deleteGame = async (gameId: string, ownerId: string): Promise<boolean> => {
	const game = await gameApi.findById(gameId)
	if (!game) {
		return false
	}

	const userFound = await userApi.findById(ownerId)
	if (!userFound) {
		return false
	}

	if (game.owner !== ownerId) return false

	await gameApi.delete({ gameId })
	return true
}

export const addWatcher = async (gameId: string, socketId: string, watcherId: string): Promise<Game | undefined> => {
	const game = await gameApi.findById(gameId)
	if (!game) {
		return
	}

	const userFound = await userApi.findById(watcherId)
	if (!userFound) {
		return resolveUsers(game!)
	}
	const refreshedGame = await gameApi.addWatcher({
		socketId: socketId,
		userId: watcherId,
		game: gameId
	})
	return resolveUsers(refreshedGame!)
}

export const removeWatcher = async (gameId: string, socketId: string): Promise<Game | undefined> => {
	const game = await gameApi.findById(gameId)
	if (!game) {
		return
	}

	const refreshedGame = await gameApi.removeWatcher({
		socketId,
		game: gameId
	})
	return resolveUsers(refreshedGame!)
}
