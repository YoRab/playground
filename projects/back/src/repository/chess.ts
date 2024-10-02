import chessApi, { type DBChess } from '@back/api/chess'
import userApi from '@back/api/user'
import { encodeToAlgebraicNotation, getDroppableCells, moveCell } from '@back/utils/chess'
import type { ChessGame, HistoryItem, PieceType, PieceTypeType } from '@common/chess'

const resolveUsers = async (game?: DBChess): Promise<ChessGame | undefined> => {
  if (game === undefined) return undefined

  const owner = (await userApi.findById(game.owner))!
  const players = {
    white: game.players.white ? (await userApi.findById(game.players.white))! : undefined,
    black: game.players.black ? (await userApi.findById(game.players.black))! : undefined
  }

  const droppableCells = game.pieces.reduce(
    (prev, current) => {
      prev[current.id] = getDroppableCells({ boardData: game, active: current }).map(move => move.to)
      return prev
    },
    {} as ChessGame['droppableCells']
  )

  const { id, sessionId, playerTurn, history, board, pieces, createdAt, startedAt, endedAt } = game

  return {
    id,
    sessionId,
    playerTurn,
    history,
    board,
    pieces,
    createdAt,
    startedAt,
    endedAt,
    owner,
    players,
    droppableCells
  }
}

export const findMany = async (): Promise<ChessGame[]> => {
  const games = await chessApi.findMany()
  const promises = games.map(async session => (await resolveUsers(session))!)
  return Promise.all(promises)
}

export const findChessById = async (id: string): Promise<ChessGame | undefined> => {
  const game = await chessApi.findById(id)
  return resolveUsers(game)
}

export const createGame = async (owner: string, sessionId: string): Promise<ChessGame | undefined> => {
  const userFound = await userApi.findById(owner)
  if (!userFound) {
    return
  }
  const game = await chessApi.create({ sessionId, owner })
  return resolveUsers(game)
}

export const deleteGame = async (boardId: string, ownerId: string): Promise<boolean> => {
  const game = await chessApi.findById(boardId)
  if (!game) {
    return false
  }

  const userFound = await userApi.findById(ownerId)
  if (!userFound) {
    return false
  }

  if (game.owner !== ownerId) return false

  await chessApi.delete({ boardId: boardId })
  return true
}

export const endGame = async (boardId: string, ownerId: string): Promise<boolean> => {
  const game = await chessApi.findById(boardId)
  if (!game) return false

  const userFound = await userApi.findById(ownerId)
  if (!userFound) return false

  if (game.startedAt === null) return false
  if (game.endedAt !== null) return false

  await chessApi.end({ boardId })
  return true
}

export const addPlayer = async (boardId: string, color: 'white' | 'black', userId: string): Promise<ChessGame | false> => {
  const game = await chessApi.findById(boardId)
  if (!game) return false

  const userFound = await userApi.findById(userId)
  if (!userFound) return false

  if (game.players[color] !== undefined) return false
  if (game.players[color === 'white' ? 'black' : 'white'] === userId) return false

  const refreshedGame = await chessApi.addPlayer({
    boardId,
    userId,
    color
  })
  return (await resolveUsers(refreshedGame!)) || false
}

export const movePiece = async (
  boardId: string,
  userId: string,
  pieceId: PieceType['id'],
  newPosition: [number, number],
  promotion: PieceTypeType | undefined
): Promise<ChessGame | false> => {
  const game = await chessApi.findById(boardId)
  if (!game) return false

  const userFound = await userApi.findById(userId)
  if (!userFound) return false

  if (game.endedAt !== null) return false

  const playerColor = game.players.white === userId ? 'white' : game.players.black === userId ? 'black' : false
  if (!playerColor) return false

  if (game.playerTurn !== playerColor) return false

  const piece = game.pieces.find(piece => piece.id === pieceId)
  if (!piece) return false

  const droppableCells = getDroppableCells({ boardData: game, active: piece })

  const move = droppableCells.find(droppableCell => droppableCell.to[0] === newPosition[0] && droppableCell.to[1] === newPosition[1])
  if (!move) return false
  if (move.promotion && (!promotion || !['queen', 'rook', 'bishop', 'knight'].includes(promotion))) return false

  let board = moveCell({
    board: game.board,
    newPosition: newPosition,
    enPassant: move.enPassant,
    currentActive: piece
  })

  if (move.castling) {
    board = moveCell({
      board,
      newPosition: newPosition[1] === 6 ? [newPosition[0], 5] : [newPosition[0], 3],
      enPassant: move.enPassant,
      currentActive: game.pieces.find(piece => piece.position?.[0] === newPosition[0] && piece.position?.[1] === (newPosition[1] === 6 ? 7 : 0))!
    })
  }

  const pieces: PieceType[] = game.pieces.map(pieceItem => {
    if (pieceItem.id === piece.id) {
      return { ...pieceItem, position: newPosition, type: move.promotion ? promotion! : pieceItem.type }
    }
    if (pieceItem.position?.[0] === newPosition[0] && pieceItem.position?.[1] === newPosition[1]) {
      return { ...pieceItem, position: null }
    }

    if (move.enPassant && pieceItem.position?.[0] === move.enPassant[0] && pieceItem.position?.[1] === move.enPassant[1]) {
      return { ...pieceItem, position: null }
    }

    if (move.castling && pieceItem.position?.[0] === newPosition[0] && pieceItem.position?.[1] === (newPosition[1] === 6 ? 7 : 0)) {
      return { ...pieceItem, position: [newPosition[0], newPosition[1] === 6 ? 5 : 3] }
    }
    return pieceItem
  })

  const historyMove = {
    move: encodeToAlgebraicNotation({
      color: playerColor,
      pieceId: piece.id,
      from: {
        position: piece.position!
      },
      to: {
        position: move.to
      },
      promotion: promotion,
      tookPiece: move.tookPiece,
      castling: move.castling,
      enPassant: move.enPassant
    }),
    time: Date.now()
  }

  const castling = {
    ...game.castling,
    [playerColor]: {
      queenSide:
        move.castling || piece.type === 'king' || piece.id === `${playerColor === 'white' ? 'w' : 'b'}r1`
          ? false
          : game.castling[playerColor].queenSide,
      kingSide:
        move.castling || piece.type === 'king' || piece.id === `${playerColor === 'white' ? 'w' : 'b'}r2`
          ? false
          : game.castling[playerColor].kingSide
    }
  }

  const refreshedGame = await chessApi.editBoard({
    boardId: boardId,
    board,
    pieces,
    castling,
    playerTurn: playerColor === 'white' ? 'black' : 'white',
    piece,
    historyMove,
    newPosition
  })

  //TODO check for endgame
  return (await resolveUsers(refreshedGame!)) ?? false
}
