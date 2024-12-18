import type { User } from '@common/model'

export type PieceTypeType = 'king' | 'queen' | 'knight' | 'pawn' | 'rook' | 'bishop'

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
