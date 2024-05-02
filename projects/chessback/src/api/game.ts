import { v4 as uuidv4 } from "uuid";

export type DBGame = {
	id: string;
	owner: string;
	players: [string, string] | [string] | [];
	watchers: string[];
	createdAt: number;
	startedAt: number | null;
};

let games: DBGame[] = [];

const gameApi = {
	findMany: async () => games,

	findById: async (id: string) => games.find((game) => game.id === id),

	create: async (data: { owner: string }) => {
		const game: DBGame = {
			id: uuidv4(),
			...data,
			players: [],
			watchers: [],
			createdAt: Date.now(),
			startedAt: null,
		};
		games.push(game);
		return game;
	},
	delete: async (data: { gameId: string }) => {
		games = games.filter((game) => game.id !== data.gameId);
		return true;
	},
	addWatcher: async (data: { user: string; game: string }) => {
		const gameIndex = games.findIndex((item) => item.id === data.game);
		if (gameIndex < 0) return null;

		const isAlreadyWatching =
			games[gameIndex].watchers.find((watcher) => watcher === data.user) !==
			undefined;
		if (isAlreadyWatching) return games[gameIndex];

		games[gameIndex] = {
			...games[gameIndex],
			watchers: [...games[gameIndex].watchers, data.user],
		};
		return games[gameIndex];
	},
	removeWatcher: async (data: { user: string; game: string }) => {
		const gameIndex = games.findIndex((item) => item.id === data.game);
		if (gameIndex < 0) return null;

		games[gameIndex] = {
			...games[gameIndex],
			watchers: games[gameIndex].watchers.filter(
				(watcher) => watcher !== data.user,
			),
		};
		return games[gameIndex];
	},
	addPlayer: async (data: { user: string; game: string }) => {
		const gameIndex = games.findIndex((item) => item.id === data.game);

		if (gameIndex < 0) return null;
		if (games[gameIndex].players.length > 1) return games[gameIndex];
		if (
			games[gameIndex].players.findIndex(
				(playerId) => playerId === data.user,
			) !== undefined
		)
			return games[gameIndex];

		games[gameIndex] = {
			...games[gameIndex],
			players: [...games[gameIndex].players, data.user] as
				| [string, string]
				| [string],
		};
		return games[gameIndex];
	},
};

export default gameApi;
