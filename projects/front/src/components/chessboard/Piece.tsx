import './Piece.css'
import type { PieceType } from '@common/chess'
import { PIECES_PIC } from '@front/constants/pieces'

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
