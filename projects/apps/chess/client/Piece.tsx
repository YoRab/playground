import './Piece.css'
import type { PieceType } from '../shared/types'
import { PIECES_PIC } from './pieces'

const Piece = ({ isOverlay = false, piece }: { isOverlay?: boolean; piece: Pick<PieceType, 'color' | 'type'> }) => {
  return (
    <img
      className={`Piece${isOverlay ? ' isoverlay' : ''}`}
      alt={`${piece.color} ${piece.type}`}
      src={PIECES_PIC.get(`${piece.color.at(0)}${piece.type}`)}
    />
  )
}

export default Piece
