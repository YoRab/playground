import type { PieceType } from '@front/constants/pieces'

export const moveCell = ({
	board,
	currentActive,
	row,
	col
}: {
	board: (string | null)[][]
	currentActive: PieceType
	row: number
	col: number
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
