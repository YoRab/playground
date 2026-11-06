import blackBishop from './assets/bishop_black.svg'
import whiteBishop from './assets/bishop_white.svg'
import blackKing from './assets/king_black.svg'
import whiteKing from './assets/king_white.svg'
import blackKnight from './assets/knight_black.svg'
import whiteKnight from './assets/knight_white.svg'
import blackPawn from './assets/pawn_black.svg'
import whitePawn from './assets/pawn_white.svg'
import blackQueen from './assets/queen_black.svg'
import whiteQueen from './assets/queen_white.svg'
import blackRook from './assets/rook_black.svg'
import whiteRook from './assets/rook_white.svg'

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
