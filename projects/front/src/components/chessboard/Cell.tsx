import React from 'react'
import './Cell.css'
import { useDroppable } from '@dnd-kit/core'
import Piece from './Piece'
import type { PieceType } from '@front/constants/pieces'
import Draggable from './dnd/Draggable'

const COL_KEY = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const Cell = ({
	playing,
	piece,
	id,
	col,
	row,
	dropEnabled = false,
	isSelected,
	handleDropOnCell
}: {
	playing: 0 | 1
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

	const disabled = (piece?.color === 'black' && playing === 1) || (piece?.color === 'white' && playing === 0)

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
