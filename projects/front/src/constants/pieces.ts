import type { PieceType, PieceTypeType } from '@common/chess'
import blackBishop from '@front/assets/pieces/bishop_black.svg'
import whiteBishop from '@front/assets/pieces/bishop_white.svg'
import blackKing from '@front/assets/pieces/king_black.svg'
import whiteKing from '@front/assets/pieces/king_white.svg'
import blackKnight from '@front/assets/pieces/knight_black.svg'
import whiteKnight from '@front/assets/pieces/knight_white.svg'
import blackPawn from '@front/assets/pieces/pawn_black.svg'
import whitePawn from '@front/assets/pieces/pawn_white.svg'
import blackQueen from '@front/assets/pieces/queen_black.svg'
import whiteQueen from '@front/assets/pieces/queen_white.svg'
import blackRook from '@front/assets/pieces/rook_black.svg'
import whiteRook from '@front/assets/pieces/rook_white.svg'

export const PIECES_PIC: Map<string, string> = new Map([
  ['brook', blackRook],
  ['bknight', blackKnight],
  ['bbishop', blackBishop],
  ['bqueen', blackQueen],
  ['bking', blackKing],
  ['bpawn', blackPawn],
  ['wpawn', whitePawn],
  ['wrook', whiteRook],
  ['wknight', whiteKnight],
  ['wbishop', whiteBishop],
  ['wqueen', whiteQueen],
  ['wking', whiteKing]
])
