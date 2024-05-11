import React from 'react'
import './Cell.css'
import { useDroppable } from '@dnd-kit/core'
import Piece from './Piece'
import Draggable from './dnd/Draggable'
import { PieceType } from '@common/chess'

const COL_KEY = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const Cell = ({
	playerTurn,
	userColor,
	piece,
	id,
	col,
	row,
	dropEnabled = false,
	isSelected,
	handleDropOnCell
}: {
	playerTurn: 'white' | 'black'
	userColor: 'white' | 'black' | undefined
	piece: PieceType | undefined
	id: string
	col: number
	row: number
	dropEnabled?: boolean
	isSelected: boolean
	handleDropOnCell: (row: number, col: number) => void
}) => {
	const { isOver, setNodeRef } = useDroppable({ id, disabled: !dropEnabled, data: { position: [row, col] } })

	const handleClick = (e: React.MouseEvent) => {
		if (dropEnabled) {
			e.stopPropagation()
			handleDropOnCell(row, col)
		}
	}
	const isUserTurn = userColor === playerTurn
	const disabled = !isUserTurn || (piece && piece?.color !== playerTurn)

	return (
		<div
			className={`Cell${isOver ? ' isover' : ''}${dropEnabled ? (disabled ? ' Highlighted Catchable' : ' Highlighted') : ''}${
				isSelected ? ' isselected' : ''
			}`}
			ref={setNodeRef}
			onClick={handleClick}
		>
			{col === 0 && <span className='Rowindicator'>{8 - row}</span>}
			{row === 7 && <span className='Colindicator'>{COL_KEY[col]}</span>}
			{piece && (
				<Draggable id={piece.id} disabled={disabled}>
					<Piece piece={piece} />
				</Draggable>
			)}
		</div>
	)
}

export default Cell
