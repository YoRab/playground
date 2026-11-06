import type { User } from '@platform/model'

export type PieceTypeType = 'king' | 'queen' | 'knight' | 'pawn' | 'rook' | 'bishop'

/** Pieces a pawn can be promoted to */
export const PROMOTIONS = ['queen', 'rook', 'bishop', 'knight'] as const

export type Castling = { white: { queenSide: boolean; kingSide: boolean }; black: { queenSide: boolean; kingSide: boolean } }

/** What the move rules need to know about a game */
export type BoardData = {
  pieces: PieceType[]
  history: { move: string; time: number }[]
  board: (string | null)[][]
  castling: Castling
}

export type PieceType = {
  position: [number, number] | null
  type: PieceTypeType
  color: 'white' | 'black'
  id: string
}

export type ChessAI = {
  id: string
  pseudo: string
  type: 'AI'
  state: 'ready' | 'notReady'
}

export type ChessUser = User | ChessAI

export type ChessGame = {
  id: string
  roomId: string
  owner: User
  players: { white?: ChessUser | undefined; black?: ChessUser | undefined }
  playerTurn: 'white' | 'black'
  history: { move: string; time: number }[]
  board: (string | null)[][]
  pieces: PieceType[]
  droppableCells: Record<PieceType['id'], [number, number][]>
  createdAt: number
  startedAt: number | null
  endedAt: number | null
  winner?: ChessUser | undefined
  result?: string | undefined
}

export type HistoryItem = {
  color: 'white' | 'black'
  pieceId: string
  from: {
    position: [number, number]
  }
  to: {
    position: [number, number]
  }
  promotion?: PieceTypeType | undefined
  tookPiece?: boolean
  enPassant?: [number, number] | undefined
  castling?: boolean
}
