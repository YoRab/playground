import { PieceType } from '@front/constants/pieces'
import { moveCell } from '@front/utils/array'
const PIECE_ORDER = ['r1', 'k1', 'b1', 'queen', 'king', 'b2', 'k2', 'r2']

/**
 * TODO
 * - ROC
 * - Prise en passant
 * - Promotion
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
			row: move[0],
			col: move[1],
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
