import type { PieceType } from '@common/chess'
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

export const PIECES_PIC: Map<PieceType['id'], string> = new Map([
  ['br1', blackRook],
  ['bk1', blackKnight],
  ['bb1', blackBishop],
  ['bqueen', blackQueen],
  ['bking', blackKing],
  ['bb2', blackBishop],
  ['bk2', blackKnight],
  ['br2', blackRook],
  ['bp1', blackPawn],
  ['bp2', blackPawn],
  ['bp3', blackPawn],
  ['bp4', blackPawn],
  ['bp5', blackPawn],
  ['bp6', blackPawn],
  ['bp7', blackPawn],
  ['bp8', blackPawn],
  ['wp1', whitePawn],
  ['wp2', whitePawn],
  ['wp3', whitePawn],
  ['wp4', whitePawn],
  ['wp5', whitePawn],
  ['wp6', whitePawn],
  ['wp7', whitePawn],
  ['wp8', whitePawn],
  ['wr1', whiteRook],
  ['wk1', whiteKnight],
  ['wb1', whiteBishop],
  ['wqueen', whiteQueen],
  ['wking', whiteKing],
  ['wb2', whiteBishop],
  ['wk2', whiteKnight],
  ['wr2', whiteRook]
])
