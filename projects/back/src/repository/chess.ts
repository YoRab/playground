import chessApi, { type DBChess } from '@back/api/chess'
import userApi from '@back/api/user'
import { getDroppableCells } from '@back/utils/chess'
import type { ChessGame, PieceType } from '@common/chess'

const resolveUsers = async (game?: DBChess): Promise<ChessGame | undefined> => {
  if (game === undefined) return undefined

  const owner = (await userApi.findById(game.owner))!
  const players = {
    white: game.players.white ? (await userApi.findById(game.players.white))! : undefined,
    black: game.players.black ? (await userApi.findById(game.players.black))! : undefined
  }

  return {
    ...game,
    owner,
    players
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
  newPosition: [number, number]
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

  const droppableCells = getDroppableCells({ boardData: { pieces: game.pieces, board: game.board }, active: piece })

  const isMoveCorrect = !!droppableCells.find(droppableCell => droppableCell[0] === newPosition[0] && droppableCell[1] === newPosition[1])
  if (!isMoveCorrect) return false

  const refreshedGame = await chessApi.movePiece({
    playerColor,
    boardId: boardId,
    piece,
    newPosition
  })

  //TODO check for endgame
  return (await resolveUsers(refreshedGame!)) ?? false
}
