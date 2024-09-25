import React from 'react'
import './Piece.css'
import type { PieceType } from '@common/chess'
import { PIECES_PIC } from '@front/constants/pieces'

const Piece = ({ isOverlay = false, piece }: { isOverlay?: boolean; piece: PieceType }) => {
  // biome-ignore lint/a11y/useAltText: <explanation>
  return <img className={`Piece${isOverlay ? ' isoverlay' : ''}`} src={PIECES_PIC.get(piece.id)} />
}

export default Piece
