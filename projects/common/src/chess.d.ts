import { User } from '@common/model'

export type PieceTypeType = 'king' | 'queen' | 'knight' | 'pawn' | 'rook' | 'bishop'

export type PieceType = {
	position: [number, number] | null
	type: PieceTypeType
	color: 'white' | 'black'
	id: string
}

export type ChessGame = {
	id: string
	sessionId: string
	owner: User
	players: { white?: User | undefined; black?: User | undefined }
	playerTurn: 'white' | 'black'
	history: { move: string; time: number }[]
	board: (string | null)[][]
	pieces: PieceType[]
	createdAt: number
	startedAt: number | null
	endedAt: number | null
}
