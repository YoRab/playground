import type React from 'react'
import './Cell.css'
import type { PieceType } from '@common/chess'
import { useDroppable } from '@dnd-kit/core'
import Piece from './Piece'
import Draggable from './dnd/Draggable'

const COL_KEY = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const Cell = ({
  playerTurn,
  isGameEnded = false,
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
  isGameEnded?: boolean
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
  const disabled = isGameEnded || !isUserTurn || (piece && piece?.color !== playerTurn)

  return (
    <div
      className={`Cell${isOver ? ' isover' : ''}${dropEnabled ? (disabled ? ' Highlighted Catchable' : ' Highlighted') : ''}${
        isSelected ? ' isselected' : ''
      }`}
      ref={setNodeRef}
      onClick={handleClick}
    >
      {col === (userColor === 'black' ? 7 : 0) && <span className='Rowindicator'>{8 - row}</span>}
      {row === (userColor === 'black' ? 0 : 7) && <span className='Colindicator'>{COL_KEY[col]}</span>}
      {piece && (
        <Draggable id={piece.id} disabled={disabled}>
          <Piece piece={piece} />
        </Draggable>
      )}
    </div>
  )
}

export default Cell
