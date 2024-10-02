import React from 'react'
import './Piece.css'
import type { PieceType } from '@common/chess'
import { PIECES_PIC } from '@front/constants/pieces'

const Piece = ({ isOverlay = false, piece }: { isOverlay?: boolean; piece: Pick<PieceType, 'color' | 'type'> }) => {
  // biome-ignore lint/a11y/useAltText: <explanation>
  return <img className={`Piece${isOverlay ? ' isoverlay' : ''}`} src={PIECES_PIC.get(`${piece.color.at(0)}${piece.type}`)} />
}

export default Piece
