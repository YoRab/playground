import { useDroppable } from '@dnd-kit/core'
import type React from 'react'
import type { PieceType } from '../shared/types'
import classes from './Cell.module.css'
import Draggable from './dnd/Draggable'
import Piece from './Piece'

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
    // biome-ignore lint/a11y/noStaticElementInteractions: click-to-move complements drag and drop, which is pointer-only
    <div
      className={classes.cell}
      data-dark={(row + col) % 2 === 1 || undefined}
      data-selected={isSelected || undefined}
      data-over={isOver || undefined}
      data-highlighted={dropEnabled || undefined}
      data-catchable={(dropEnabled && disabled) || undefined}
      ref={setNodeRef}
      onClick={handleClick}
    >
      {col === (userColor === 'black' ? 7 : 0) && <span className={classes.rowIndicator}>{8 - row}</span>}
      {row === (userColor === 'black' ? 0 : 7) && <span className={classes.colIndicator}>{COL_KEY[col]}</span>}
      {piece && (
        <Draggable id={piece.id} disabled={disabled}>
          <Piece piece={piece} />
        </Draggable>
      )}
    </div>
  )
}

export default Cell
