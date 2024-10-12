import chessApi, { type DBChess } from '@back/modules/chess/chessApi'
import * as userRepo from '@back/repository/user'
import * as chessAIRepo from './AI/chessAIRepo'
import { encodeToAlgebraicNotation, getDroppableCells, isThereChess, moveCell } from '@back/modules/chess/chessUtils'
import type { ChessGame, PieceType, PieceTypeType } from '@common/chess'
import type { User } from '@common/model'

const resolveUser = async (user?: { type: 'human' | 'AI'; id: string } | undefined | null): Promise<User | undefined> => {
  if (!user) return undefined

  if (user.type === 'human') {
    return (await userRepo.findUserById(user.id))!
  }
  return (await chessAIRepo.findAIById(user.id))!
}

const resolveGame = async (game?: DBChess): Promise<ChessGame | undefined> => {
  if (game === undefined) return undefined

  const owner = (await userRepo.findUserById(game.owner))!
  const players = {
    white: await resolveUser(game.players.white),
    black: await resolveUser(game.players.black)
  }

  const winner = await resolveUser(game.winner)

  const droppableCells = game.pieces.reduce(
    (prev, current) => {
      prev[current.id] = getDroppableCells({ boardData: game, active: current }).map(move => move.to)
      return prev
    },
    {} as ChessGame['droppableCells']
  )

  const { id, sessionId, playerTurn, history, board, pieces, createdAt, startedAt, endedAt, result } = game

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
    droppableCells,
    winner,
    result: result ?? undefined
  }
}

export const findMany = async (): Promise<ChessGame[]> => {
  const games = await chessApi.findMany()
  const promises = games.map(async session => (await resolveGame(session))!)
  return Promise.all(promises)
}

export const findChessById = async (id: string): Promise<ChessGame | undefined> => {
  const game = await chessApi.findById(id)
  return resolveGame(game)
}

export const createGame = async (owner: string, sessionId: string): Promise<ChessGame | undefined> => {
  const userFound = await userRepo.findUserById(owner)
  if (!userFound) {
    return
  }
  const game = await chessApi.create({ sessionId, owner })
  return resolveGame(game)
}

export const deleteGame = async (boardId: string, ownerId: string): Promise<boolean> => {
  const game = await chessApi.findById(boardId)
  if (!game) {
    return false
  }

  const userFound = await userRepo.findUserById(ownerId)
  if (!userFound) {
    return false
  }

  if (game.owner !== ownerId) return false

  await chessApi.delete({ boardId: boardId })
  return true
}

export const giveUpGame = async (boardId: string, ownerId: string): Promise<boolean> => {
  const game = await chessApi.findById(boardId)
  if (!game) return false

  const userFound = await userRepo.findUserById(ownerId)
  if (!userFound) return false

  if (game.startedAt === null) return false
  if (game.endedAt !== null) return false

  const winner = game.players.black?.type === 'human' && game.players.black?.id === ownerId ? game.players.white! : game.players.black!

  await chessApi.endGame({ boardId, winner: winner, result: 'giveup' })

  return true
}

export const addPlayer = async (boardId: string, color: 'white' | 'black', userId: string, userType: 'human' | 'AI'): Promise<ChessGame | false> => {
  const game = await chessApi.findById(boardId)
  if (!game) return false

  const userFound = userType === 'human' ? await userRepo.findUserById(userId) : await chessAIRepo.findAIById(userId)
  if (!userFound) return false

  if (game.players[color] !== undefined) return false
  if (game.players[color === 'white' ? 'black' : 'white']?.type === userType && game.players[color === 'white' ? 'black' : 'white']?.id === userId)
    return false

  const refreshedGame = await chessApi.addPlayer({
    boardId,
    userId,
    userType,
    color
  })
  return (await resolveGame(refreshedGame!)) || false
}

export const movePiece = async (
  boardId: string,
  userId: string,
  userType: 'human' | 'AI',
  pieceId: PieceType['id'],
  newPosition: [number, number],
  promotion: PieceTypeType | undefined
): Promise<ChessGame | false> => {
  const game = await chessApi.findById(boardId)
  if (!game) return false

  const userFound = userType === 'human' ? await userRepo.findUserById(userId) : await chessAIRepo.findAIById(userId)
  if (!userFound) return false

  if (game.endedAt !== null) return false

  const playerColor =
    game.players.white?.type === userType && game.players.white.id === userId
      ? 'white'
      : game.players.black?.type === userType && game.players.black.id === userId
        ? 'black'
        : false
  if (!playerColor) return false

  if (game.playerTurn !== playerColor) return false

  const piece = game.pieces.find(piece => piece.id === pieceId)
  if (!piece) return false
  if (piece.color !== playerColor) return false

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

  const nextGame = (await resolveGame(refreshedGame!))!

  const otherPlayerColor = playerColor === 'white' ? 'black' : 'white'

  const nbMoves = Object.keys(nextGame.droppableCells).reduce(
    (prev, current) => prev + (current.at(0)! === otherPlayerColor.at(0) ? nextGame.droppableCells[current].length : 0),
    0
  )

  if (nbMoves === 0) {
    const isNowChess = isThereChess(refreshedGame!, otherPlayerColor)
    const endedGame = await chessApi.endGame({
      boardId,
      winner: isNowChess ? { type: userType, id: userId } : null,
      result: isNowChess ? 'win' : 'pat'
    })
    return (await resolveGame(endedGame!))!
  }

  return nextGame
}
