import { PieceType } from '@common/chess'

const PIECE_ORDER = ['r1', 'k1', 'b1', 'queen', 'king', 'b2', 'k2', 'r2']

/**
 * TODO
 * - ROC
 * - Prise en passant
 * - Promotion
 * - end game
 *  */

export const getInitBoard = () => {
	const board: (string | null)[][] = []
	for (let row = 0; row < 8; row++) {
		const boardRow: (string | null)[] = []
		for (let col = 0; col < 8; col++) {
			switch (row) {
				case 0:
				case 7:
					boardRow[col] = `${row === 0 ? 'b' : 'w'}${PIECE_ORDER[col]}`
					break
				case 1:
				case 6:
					boardRow[col] = `${row === 1 ? 'b' : 'w'}p${col + 1}`
					break
				default:
					boardRow[col] = null
					break
			}
		}
		board[row] = boardRow
	}
	return board
}

export const PIECES: PieceType[] = [
	{
		position: [0, 0],
		type: 'rook',
		color: 'black',
		id: 'br1'
	},
	{
		position: [0, 1],
		type: 'knight',
		color: 'black',
		id: 'bk1'
	},
	{
		position: [0, 2],
		type: 'bishop',
		color: 'black',
		id: 'bb1'
	},
	{
		position: [0, 3],
		type: 'queen',
		color: 'black',
		id: 'bqueen'
	},
	{
		position: [0, 4],
		type: 'king',
		color: 'black',
		id: 'bking'
	},
	{
		position: [0, 5],
		type: 'bishop',
		color: 'black',
		id: 'bb2'
	},
	{
		position: [0, 6],
		type: 'knight',
		color: 'black',
		id: 'bk2'
	},
	{
		position: [0, 7],
		type: 'rook',
		color: 'black',
		id: 'br2'
	},
	{
		position: [1, 0],
		type: 'pawn',
		color: 'black',
		id: 'bp1'
	},
	{
		position: [1, 1],
		type: 'pawn',
		color: 'black',
		id: 'bp2'
	},
	{
		position: [1, 2],
		type: 'pawn',
		color: 'black',
		id: 'bp3'
	},
	{
		position: [1, 3],
		type: 'pawn',
		color: 'black',
		id: 'bp4'
	},
	{
		position: [1, 4],
		type: 'pawn',
		color: 'black',
		id: 'bp5'
	},
	{
		position: [1, 5],
		type: 'pawn',
		color: 'black',
		id: 'bp6'
	},
	{
		position: [1, 6],
		type: 'pawn',
		color: 'black',
		id: 'bp7'
	},
	{
		position: [1, 7],
		type: 'pawn',
		color: 'black',
		id: 'bp8'
	},
	{
		position: [6, 0],
		type: 'pawn',
		color: 'white',
		id: 'wp1'
	},
	{
		position: [6, 1],
		type: 'pawn',
		color: 'white',
		id: 'wp2'
	},
	{
		position: [6, 2],
		type: 'pawn',
		color: 'white',
		id: 'wp3'
	},
	{
		position: [6, 3],
		type: 'pawn',
		color: 'white',
		id: 'wp4'
	},
	{
		position: [6, 4],
		type: 'pawn',
		color: 'white',
		id: 'wp5'
	},
	{
		position: [6, 5],
		type: 'pawn',
		color: 'white',
		id: 'wp6'
	},
	{
		position: [6, 6],
		type: 'pawn',
		color: 'white',
		id: 'wp7'
	},
	{
		position: [6, 7],
		type: 'pawn',
		color: 'white',
		id: 'wp8'
	},
	{
		position: [7, 0],
		type: 'rook',
		color: 'white',
		id: 'wr1'
	},
	{
		position: [7, 1],
		type: 'knight',
		color: 'white',
		id: 'wk1'
	},
	{
		position: [7, 2],
		type: 'bishop',
		color: 'white',
		id: 'wb1'
	},

	{
		position: [7, 3],
		type: 'queen',
		color: 'white',
		id: 'wqueen'
	},

	{
		position: [7, 4],
		type: 'king',
		color: 'white',
		id: 'wking'
	},

	{
		position: [7, 5],
		type: 'bishop',
		color: 'white',
		id: 'wb2'
	},
	{
		position: [7, 6],
		type: 'knight',
		color: 'white',
		id: 'wk2'
	},
	{
		position: [7, 7],
		type: 'rook',
		color: 'white',
		id: 'wr2'
	}
]

export const moveCell = ({
	board,
	currentActive,
	newPosition: [row, col]
}: {
	board: (string | null)[][]
	currentActive: Pick<PieceType, 'id' | 'position'>
	newPosition: [number, number]
}) => {
	if (!currentActive.position) return board
	const boardRow = board[currentActive.position[0]]
	const newBoardCol = [...boardRow.slice(0, currentActive.position[1]), null, ...boardRow.slice(currentActive.position[1] + 1)]
	const newBoard = [...board.slice(0, currentActive.position[0]), newBoardCol, ...board.slice(currentActive.position[0] + 1)]

	const newBoardRow = newBoard[row]
	const newNewBoardCol = [...newBoardRow.slice(0, col), currentActive.id, ...newBoardRow.slice(col + 1)]
	const newNewBoard = [...newBoard.slice(0, row), newNewBoardCol, ...newBoard.slice(row + 1)]

	return newNewBoard
}

const getMoveIfFree = ({
	board,
	targetRow,
	targetCol,
	pieces,
	active,
	canTake = true
}: {
	board: (string | null)[][]
	targetRow: number
	targetCol: number
	pieces: PieceType[]
	active: PieceType
	canTake?: boolean
}): { move: [number, number] | undefined; keep: boolean } => {
	const { color } = active
	const targetCell = board[targetRow][targetCol]
	if (!targetCell) {
		return { move: [targetRow, targetCol], keep: true }
	}
	const targetPiece = pieces.find(piece => piece.id === targetCell)
	return {
		move: canTake && targetPiece?.color !== color ? [targetRow, targetCol] : undefined,
		keep: false
	}
}

const getPawnMoves = (board: (string | null)[][], pieces: PieceType[], active: PieceType): [number, number][] => {
	const { color, position } = active
	if (!position) return []

	const moves: [number, number][] = []

	const [checkPos, checkPosNext, direction] =
		color === 'white' ? [() => position[0] > 0, () => position[0] === 6, -1] : [() => position[0] < 7, () => position[0] === 1, 1]

	if (checkPos()) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 1 * direction,
			targetCol: position[1],
			canTake: false
		})
		if (check.move) moves.push(check.move)
		if (checkPosNext() && check.keep) {
			const checkNext = getMoveIfFree({
				board,
				pieces,
				active,
				targetRow: position[0] + 2 * direction,
				targetCol: position[1],
				canTake: false
			})
			if (checkNext.move) moves.push(checkNext.move)
		}

		if (position[1] > 0) {
			const checkLeft = getMoveIfFree({
				board,
				pieces,
				active,
				targetRow: position[0] + 1 * direction,
				targetCol: position[1] - 1
			})
			if (checkLeft.move && !checkLeft.keep) moves.push(checkLeft.move)
		}

		if (position[1] < 7) {
			const checkRight = getMoveIfFree({
				board,
				pieces,
				active,
				targetRow: position[0] + 1 * direction,
				targetCol: position[1] + 1
			})
			if (checkRight.move && !checkRight.keep) moves.push(checkRight.move)
		}
	}
	return moves
}

const getKingMoves = (board: (string | null)[][], pieces: PieceType[], active: PieceType): [number, number][] => {
	const { color, position } = active
	if (!position) return []

	const moves: [number, number][] = []
	if (position[0] > 0 && position[1] > 0) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] - 1,
			targetCol: position[1] - 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] > 0) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] - 1,
			targetCol: position[1]
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] > 0 && position[1] < 7) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] - 1,
			targetCol: position[1] + 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[1] > 0) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0],
			targetCol: position[1] - 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[1] < 7) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0],
			targetCol: position[1] + 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] < 7 && position[1] > 0) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 1,
			targetCol: position[1] - 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] < 7 && position[1] < 7) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 1,
			targetCol: position[1] + 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] < 7) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 1,
			targetCol: position[1]
		})
		if (check.move) moves.push(check.move)
	}
	return moves
}

const getRookMoves = (board: (string | null)[][], pieces: PieceType[], active: PieceType): [number, number][] => {
	const { position } = active
	if (!position) return []

	const moves: [number, number][] = []

	for (let i = position[0] - 1; i >= 0; i--) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: i,
			targetCol: position[1]
		})
		if (check.move) moves.push(check.move)
		if (!check.keep) break
	}

	for (let i = position[0] + 1; i < 8; i++) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: i,
			targetCol: position[1]
		})
		if (check.move) moves.push(check.move)
		if (!check.keep) break
	}

	for (let i = position[1] - 1; i >= 0; i--) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0],
			targetCol: i
		})
		if (check.move) moves.push(check.move)
		if (!check.keep) break
	}

	for (let i = position[1] + 1; i < 8; i++) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0],
			targetCol: i
		})
		if (check.move) moves.push(check.move)
		if (!check.keep) break
	}
	return moves
}

const getBishopMoves = (board: (string | null)[][], pieces: PieceType[], active: PieceType): [number, number][] => {
	const { color, position } = active
	if (!position) return []

	const moves: [number, number][] = []

	for (let i = position[0] - 1; i >= 0; i--) {
		if (position[1] - (position[0] - i) >= 0) {
			const check = getMoveIfFree({
				board,
				pieces,
				active,
				targetRow: i,
				targetCol: position[1] - (position[0] - i)
			})
			if (check.move) moves.push(check.move)
			if (!check.keep) break
		}
	}
	for (let i = position[0] - 1; i >= 0; i--) {
		if (position[1] + (position[0] - i) < 8) {
			const check = getMoveIfFree({
				board,
				pieces,
				active,
				targetRow: i,
				targetCol: position[1] + (position[0] - i)
			})
			if (check.move) moves.push(check.move)
			if (!check.keep) break
		}
	}

	for (let i = position[0] + 1; i < 8; i++) {
		if (position[1] - (position[0] - i) >= 0) {
			const check = getMoveIfFree({
				board,
				pieces,
				active,
				targetRow: i,
				targetCol: position[1] - (position[0] - i)
			})
			if (check.move) moves.push(check.move)
			if (!check.keep) break
		}
	}
	for (let i = position[0] + 1; i < 8; i++) {
		if (position[1] + (position[0] - i) < 8) {
			const check = getMoveIfFree({
				board,
				pieces,
				active,
				targetRow: i,
				targetCol: position[1] + (position[0] - i)
			})
			if (check.move) moves.push(check.move)
			if (!check.keep) break
		}
	}

	return moves
}

const getQueenMoves = (board: (string | null)[][], pieces: PieceType[], active: PieceType): [number, number][] => {
	return [...getRookMoves(board, pieces, active), ...getBishopMoves(board, pieces, active)]
}

const getKnightMoves = (board: (string | null)[][], pieces: PieceType[], active: PieceType): [number, number][] => {
	const { color, position } = active
	if (!position) return []

	const moves: [number, number][] = []
	if (position[0] > 1 && position[1] > 0) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] - 2,
			targetCol: position[1] - 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] > 1 && position[1] < 7) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] - 2,
			targetCol: position[1] + 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] < 6 && position[1] > 0) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 2,
			targetCol: position[1] - 1
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] < 6 && position[1] < 7) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 2,
			targetCol: position[1] + 1
		})
		if (check.move) moves.push(check.move)
	}

	if (position[0] > 0 && position[1] > 1) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] - 1,
			targetCol: position[1] - 2
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] < 7 && position[1] > 1) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 1,
			targetCol: position[1] - 2
		})
		if (check.move) moves.push(check.move)
	}

	if (position[0] > 0 && position[1] < 6) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] - 1,
			targetCol: position[1] + 2
		})
		if (check.move) moves.push(check.move)
	}
	if (position[0] < 7 && position[1] < 6) {
		const check = getMoveIfFree({
			board,
			pieces,
			active,
			targetRow: position[0] + 1,
			targetCol: position[1] + 2
		})
		if (check.move) moves.push(check.move)
	}
	return moves
}

export const getPiecesMoves = (board: (string | null)[][], pieces: PieceType[], active: PieceType): [number, number][] => {
	switch (active.type) {
		case 'pawn':
			return getPawnMoves(board, pieces, active)
		case 'king':
			return getKingMoves(board, pieces, active)
		case 'queen':
			return getQueenMoves(board, pieces, active)
		case 'rook':
			return getRookMoves(board, pieces, active)
		case 'knight':
			return getKnightMoves(board, pieces, active)
		case 'bishop':
			return getBishopMoves(board, pieces, active)
	}
}

const isThereChess = (board: (string | null)[][], pieces: PieceType[], color: 'white' | 'black') => {
	const kingPos = pieces.find(piece => piece.id === `${color === 'white' ? 'w' : 'b'}king`)?.position
	if (!kingPos) return false
	const ennemyPieces = pieces.filter(piece => piece.color === (color === 'white' ? 'black' : 'white'))
	for (const piece of ennemyPieces) {
		const pieceMoves = getPiecesMoves(board, pieces, piece)
		for (const ennemyMove of pieceMoves) {
			if (ennemyMove[0] === kingPos[0] && ennemyMove[1] === kingPos[1]) return true
		}
	}
	return false
}

const getMovesWithoutChessMate = ({
	boardData: { board, pieces },
	active,
	moves
}: {
	boardData: {
		board: (string | null)[][]
		pieces: PieceType[]
	}
	active: PieceType
	moves: [number, number][]
}) => {
	const movesWithoutChessMate: [number, number][] = []
	for (const move of moves) {
		const simulatedBoard = moveCell({
			board,
			newPosition: move,
			currentActive: active
		})
		const newPieces = pieces.map(piece => {
			if (piece.id === active.id) {
				return { ...piece, position: move }
			}
			if (piece.position?.[0] === move[0] && piece.position?.[1] === move[1]) {
				return { ...piece, position: null }
			}
			return piece
		})
		if (!isThereChess(simulatedBoard, newPieces, active.color)) {
			movesWithoutChessMate.push(move)
		}
	}
	return movesWithoutChessMate
}

export const getDroppableCells = ({
	boardData,
	active
}: {
	boardData: {
		board: (string | null)[][]
		pieces: PieceType[]
	}
	active: PieceType
}): [number, number][] => {
	const { board, pieces } = boardData
	const moves = getPiecesMoves(board, pieces, active)
	const movesWithoutChessMate = getMovesWithoutChessMate({
		boardData,
		active,
		moves
	})
	return movesWithoutChessMate
}
