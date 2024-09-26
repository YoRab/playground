import { PIECES, encodeToAlgebraicNotation, getInitBoard, moveCell } from '@back/utils/chess'
import type { HistoryItem, PieceType } from '@common/chess'
import { v4 as uuidv4 } from 'uuid'
export type DBChess = {
  id: string
  sessionId: string
  owner: string
  players: { white?: string | undefined; black?: string | undefined }
  playerTurn: 'white' | 'black'
  history: { move: string; time: number }[]
  board: (string | null)[][]
  pieces: PieceType[]
  castling: { white: { queenSide: boolean; kingSide: boolean }; black: { queenSide: boolean; kingSide: boolean } }
  createdAt: number
  startedAt: number | null
  endedAt: number | null
}

let games: DBChess[] = []

const chessApi = {
  findMany: async () => games,

  findById: async (id: string) => games.find(game => game.id === id),

  create: async (data: { sessionId: string; owner: string }) => {
    const game: DBChess = {
      id: uuidv4(),
      ...data,
      players: { white: undefined, black: undefined },
      playerTurn: 'white',
      history: [],
      board: getInitBoard(),
      pieces: PIECES,
      castling: { white: { queenSide: true, kingSide: true }, black: { queenSide: true, kingSide: true } },
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null
    }
    games.push(game)
    return game
  },
  delete: async (data: { boardId: string }) => {
    games = games.filter(game => game.id !== data.boardId)
    return true
  },
  end: async (data: { boardId: string }) => {
    const gameIndex = games.findIndex(item => item.id === data.boardId)
    if (gameIndex < 0) return null
    games[gameIndex] = {
      ...games[gameIndex],
      endedAt: Date.now()
    }
    return games[gameIndex]
  },
  addPlayer: async (data: { userId: string; boardId: string; color: 'white' | 'black' }) => {
    const gameIndex = games.findIndex(item => item.id === data.boardId)

    if (gameIndex < 0) return null

    games[gameIndex] = {
      ...games[gameIndex],
      players: { ...games[gameIndex].players, [data.color]: data.userId }
    }
    return games[gameIndex]
  },

  editBoard: async (data: {
    boardId: string
    board: (string | null)[][]
    pieces: PieceType[]
    playerTurn: 'white' | 'black'
    castling: {
      white: {
        queenSide: boolean
        kingSide: boolean
      }
      black: {
        queenSide: boolean
        kingSide: boolean
      }
    }
    piece: Pick<PieceType, 'id' | 'position'>
    historyMove: {
      move: string
      time: number
    }
    newPosition: [number, number]
  }) => {
    const gameIndex = games.findIndex(item => item.id === data.boardId)

    if (gameIndex < 0) return null

    games[gameIndex] = {
      ...games[gameIndex],
      playerTurn: data.playerTurn,
      board: data.board,
      pieces: data.pieces,
      castling: data.castling,
      startedAt: games[gameIndex].startedAt || Date.now(),
      history: [...games[gameIndex].history, data.historyMove]
    }
    return games[gameIndex]
  }
}

export default chessApi
