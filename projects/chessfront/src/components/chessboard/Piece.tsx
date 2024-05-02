import React from 'react';
import { PieceType } from '../../constants/pieces';
import './Piece.css'

const Piece = ({ isOverlay = false, piece }: { isOverlay?: boolean, piece: PieceType }) => {
    return (<img className={`Piece${isOverlay ? ' isoverlay' : ''}`} src={piece.pic} />)
}

export default Piece
