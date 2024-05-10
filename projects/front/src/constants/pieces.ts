import blackKing from '@front/assets/pieces/king_black.svg'
import blackBishop from '@front/assets/pieces/bishop_black.svg'
import blackQueen from '@front/assets/pieces/queen_black.svg'
import blackPawn from '@front/assets/pieces/pawn_black.svg'
import blackRook from '@front/assets/pieces/rook_black.svg'
import blackKnight from '@front/assets/pieces/knight_black.svg'
import whiteKing from '@front/assets/pieces/king_white.svg'
import whiteBishop from '@front/assets/pieces/bishop_white.svg'
import whiteQueen from '@front/assets/pieces/queen_white.svg'
import whitePawn from '@front/assets/pieces/pawn_white.svg'
import whiteRook from '@front/assets/pieces/rook_white.svg'
import whiteKnight from '@front/assets/pieces/knight_white.svg'

export type PieceTypeType = 'king' | 'queen' | 'knight' | 'pawn' | 'rook' | 'bishop'

export type PieceType = {
	position: [number, number] | null
	type: PieceTypeType
	color: 'white' | 'black'
	pic: string
	id: string
}

export const PIECES: PieceType[] = [
	{
		position: [0, 0],
		type: 'rook',
		color: 'black',
		pic: blackRook,
		id: 'br1'
	},
	{
		position: [0, 1],
		type: 'knight',
		color: 'black',
		pic: blackKnight,
		id: 'bk1'
	},
	{
		position: [0, 2],
		type: 'bishop',
		color: 'black',
		pic: blackBishop,
		id: 'bb1'
	},
	{
		position: [0, 3],
		type: 'queen',
		color: 'black',
		pic: blackQueen,
		id: 'bqueen'
	},
	{
		position: [0, 4],
		type: 'king',
		color: 'black',
		pic: blackKing,
		id: 'bking'
	},
	{
		position: [0, 5],
		type: 'bishop',
		color: 'black',
		pic: blackBishop,
		id: 'bb2'
	},
	{
		position: [0, 6],
		type: 'knight',
		color: 'black',
		pic: blackKnight,
		id: 'bk2'
	},
	{
		position: [0, 7],
		type: 'rook',
		color: 'black',
		pic: blackRook,
		id: 'br2'
	},
	{
		position: [1, 0],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp1'
	},
	{
		position: [1, 1],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp2'
	},
	{
		position: [1, 2],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp3'
	},
	{
		position: [1, 3],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp4'
	},
	{
		position: [1, 4],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp5'
	},
	{
		position: [1, 5],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp6'
	},
	{
		position: [1, 6],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp7'
	},
	{
		position: [1, 7],
		type: 'pawn',
		color: 'black',
		pic: blackPawn,
		id: 'bp8'
	},
	{
		position: [6, 0],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp1'
	},
	{
		position: [6, 1],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp2'
	},
	{
		position: [6, 2],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp3'
	},
	{
		position: [6, 3],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp4'
	},
	{
		position: [6, 4],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp5'
	},
	{
		position: [6, 5],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp6'
	},
	{
		position: [6, 6],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp7'
	},
	{
		position: [6, 7],
		type: 'pawn',
		color: 'white',
		pic: whitePawn,
		id: 'wp8'
	},
	{
		position: [7, 0],
		type: 'rook',
		color: 'white',
		pic: whiteRook,
		id: 'wr1'
	},
	{
		position: [7, 1],
		type: 'knight',
		color: 'white',
		pic: whiteKnight,
		id: 'wk1'
	},
	{
		position: [7, 2],
		type: 'bishop',
		color: 'white',
		pic: whiteBishop,
		id: 'wb1'
	},

	{
		position: [7, 3],
		type: 'queen',
		color: 'white',
		pic: whiteQueen,
		id: 'wqueen'
	},

	{
		position: [7, 4],
		type: 'king',
		color: 'white',
		pic: whiteKing,
		id: 'wking'
	},

	{
		position: [7, 5],
		type: 'bishop',
		color: 'white',
		pic: whiteBishop,
		id: 'wb2'
	},
	{
		position: [7, 6],
		type: 'knight',
		color: 'white',
		pic: whiteKnight,
		id: 'wk2'
	},
	{
		position: [7, 7],
		type: 'rook',
		color: 'white',
		pic: whiteRook,
		id: 'wr2'
	}
]
