import { v4 as uuidv4 } from 'uuid'
import type { PieceType } from '@common/chess'
import { PIECES, getInitBoard, moveCell } from '@back/utils/chess'
export type DBChess = {
	id: string
	sessionId: string
	owner: string
	players: { white?: string | undefined; black?: string | undefined }
	playerTurn: 'white' | 'black'
	history: { move: string; time: number }[]
	board: (string | null)[][]
	pieces: PieceType[]
	createdAt: number
	startedAt: number | null
	endedAt: number | null
}

let games: DBChess[] = []

const chessApi = {
	findMany: async () => games,

	findById: async (id: string) => games.find(game => game.id === id),

	create: async (data: { sessionId: string; owner: string }) => {
		const game: DBChess = {
			id: uuidv4(),
			...data,
			players: { white: undefined, black: undefined },
			playerTurn: 'white',
			history: [],
			board: getInitBoard(),
			pieces: PIECES,
			createdAt: Date.now(),
			startedAt: null,
			endedAt: null
		}
		games.push(game)
		return game
	},
	delete: async (data: { boardId: string }) => {
		games = games.filter(game => game.id !== data.boardId)
		return true
	},
	end: async (data: { boardId: string }) => {
		const gameIndex = games.findIndex(item => item.id === data.boardId)
		if (gameIndex < 0) return null
		games[gameIndex] = {
			...games[gameIndex],
			endedAt: Date.now()
		}
		return games[gameIndex]
	},
	addPlayer: async (data: { userId: string; boardId: string; color: 'white' | 'black' }) => {
		const gameIndex = games.findIndex(item => item.id === data.boardId)

		if (gameIndex < 0) return null

		games[gameIndex] = {
			...games[gameIndex],
			players: { ...games[gameIndex].players, [data.color]: data.userId }
		}
		return games[gameIndex]
	},

	movePiece: async (data: {
		playerColor: 'white' | 'black'
		boardId: string
		piece: Pick<PieceType, 'id' | 'position'>
		newPosition: [number, number]
	}) => {
		const gameIndex = games.findIndex(item => item.id === data.boardId)

		if (gameIndex < 0) return null

		games[gameIndex] = {
			...games[gameIndex],
			playerTurn: data.playerColor === 'white' ? 'black' : 'white',
			board: moveCell({
				board: games[gameIndex].board,
				newPosition: data.newPosition,
				currentActive: data.piece
			}),
			pieces: games[gameIndex].pieces.map(piece => {
				if (piece.id === data.piece.id) {
					return { ...piece, position: data.newPosition }
				}
				if (piece.position?.[0] === data.newPosition[0] && piece.position?.[1] === data.newPosition[1]) {
					return { ...piece, position: null }
				}
				return piece
			}),
			startedAt: games[gameIndex].startedAt || Date.now(),
			history: [...games[gameIndex].history, { move: '', time: Date.now() }]
		}
		return games[gameIndex]
	}
}

export default chessApi
