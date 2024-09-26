import type { DBChess } from '@back/api/chess'
import type { HistoryItem, PieceType, PieceTypeType } from '@common/chess'

const PIECE_ORDER = ['r1', 'k1', 'b1', 'queen', 'king', 'b2', 'k2', 'r2']

/**
 * TODO
 * - ROC
 * - end game / PAT
 *  */

type Move = {
  to: [number, number]
  promotion?: PieceTypeType | undefined
  tookPiece?: boolean
  castling?: boolean
  enPassant?: [number, number] | undefined
}

type BoardData = Pick<DBChess, 'pieces' | 'history' | 'board' | 'castling'>

export const getInitBoard = () => {
  const board: (string | null)[][] = []
  for (let row = 0; row < 8; row++) {
    const boardRow: (string | null)[] = []
    for (let col = 0; col < 8; col++) {
      switch (row) {
        case 0:
        case 7:
          boardRow[col] = `${row === 0 ? 'b' : 'w'}${PIECE_ORDER[col]}`
          break
        case 1:
        case 6:
          boardRow[col] = `${row === 1 ? 'b' : 'w'}p${col + 1}`
          break
        default:
          boardRow[col] = null
          break
      }
    }
    board[row] = boardRow
  }
  return board
}

export const PIECES: PieceType[] = [
  {
    position: [0, 0],
    type: 'rook',
    color: 'black',
    id: 'br1'
  },
  {
    position: [0, 1],
    type: 'knight',
    color: 'black',
    id: 'bk1'
  },
  {
    position: [0, 2],
    type: 'bishop',
    color: 'black',
    id: 'bb1'
  },
  {
    position: [0, 3],
    type: 'queen',
    color: 'black',
    id: 'bqueen'
  },
  {
    position: [0, 4],
    type: 'king',
    color: 'black',
    id: 'bking'
  },
  {
    position: [0, 5],
    type: 'bishop',
    color: 'black',
    id: 'bb2'
  },
  {
    position: [0, 6],
    type: 'knight',
    color: 'black',
    id: 'bk2'
  },
  {
    position: [0, 7],
    type: 'rook',
    color: 'black',
    id: 'br2'
  },
  {
    position: [1, 0],
    type: 'pawn',
    color: 'black',
    id: 'bp1'
  },
  {
    position: [1, 1],
    type: 'pawn',
    color: 'black',
    id: 'bp2'
  },
  {
    position: [1, 2],
    type: 'pawn',
    color: 'black',
    id: 'bp3'
  },
  {
    position: [1, 3],
    type: 'pawn',
    color: 'black',
    id: 'bp4'
  },
  {
    position: [1, 4],
    type: 'pawn',
    color: 'black',
    id: 'bp5'
  },
  {
    position: [1, 5],
    type: 'pawn',
    color: 'black',
    id: 'bp6'
  },
  {
    position: [1, 6],
    type: 'pawn',
    color: 'black',
    id: 'bp7'
  },
  {
    position: [1, 7],
    type: 'pawn',
    color: 'black',
    id: 'bp8'
  },
  {
    position: [6, 0],
    type: 'pawn',
    color: 'white',
    id: 'wp1'
  },
  {
    position: [6, 1],
    type: 'pawn',
    color: 'white',
    id: 'wp2'
  },
  {
    position: [6, 2],
    type: 'pawn',
    color: 'white',
    id: 'wp3'
  },
  {
    position: [6, 3],
    type: 'pawn',
    color: 'white',
    id: 'wp4'
  },
  {
    position: [6, 4],
    type: 'pawn',
    color: 'white',
    id: 'wp5'
  },
  {
    position: [6, 5],
    type: 'pawn',
    color: 'white',
    id: 'wp6'
  },
  {
    position: [6, 6],
    type: 'pawn',
    color: 'white',
    id: 'wp7'
  },
  {
    position: [6, 7],
    type: 'pawn',
    color: 'white',
    id: 'wp8'
  },
  {
    position: [7, 0],
    type: 'rook',
    color: 'white',
    id: 'wr1'
  },
  {
    position: [7, 1],
    type: 'knight',
    color: 'white',
    id: 'wk1'
  },
  {
    position: [7, 2],
    type: 'bishop',
    color: 'white',
    id: 'wb1'
  },

  {
    position: [7, 3],
    type: 'queen',
    color: 'white',
    id: 'wqueen'
  },

  {
    position: [7, 4],
    type: 'king',
    color: 'white',
    id: 'wking'
  },

  {
    position: [7, 5],
    type: 'bishop',
    color: 'white',
    id: 'wb2'
  },
  {
    position: [7, 6],
    type: 'knight',
    color: 'white',
    id: 'wk2'
  },
  {
    position: [7, 7],
    type: 'rook',
    color: 'white',
    id: 'wr2'
  }
]

export const moveCell = ({
  board,
  currentActive,
  enPassant,
  newPosition: [row, col]
}: {
  board: (string | null)[][]
  currentActive: Pick<PieceType, 'id' | 'position'>
  enPassant: [number, number] | undefined
  newPosition: [number, number]
}) => {
  if (!currentActive.position) return board
  const boardRow = board[currentActive.position[0]]
  const newBoardCol = [...boardRow.slice(0, currentActive.position[1]), null, ...boardRow.slice(currentActive.position[1] + 1)]
  const newBoard = [...board.slice(0, currentActive.position[0]), newBoardCol, ...board.slice(currentActive.position[0] + 1)]

  const newBoardRow = newBoard[row]
  const newNewBoardCol = [...newBoardRow.slice(0, col), currentActive.id, ...newBoardRow.slice(col + 1)]
  const newNewBoard = [...newBoard.slice(0, row), newNewBoardCol, ...newBoard.slice(row + 1)]

  if (enPassant) {
    const enPassantBoardRow = newNewBoard[enPassant[0]]
    const enPassantBoardCol = [...enPassantBoardRow.slice(0, enPassant[1]), null, ...enPassantBoardRow.slice(enPassant[1] + 1)]
    return [...newNewBoard.slice(0, enPassant[0]), enPassantBoardCol, ...newNewBoard.slice(enPassant[0] + 1)]
  }

  return newNewBoard
}

const getMoveIfFree = ({
  boardData,
  targetRow,
  targetCol,
  active,
  canTake = true
}: {
  boardData: BoardData
  targetRow: number
  targetCol: number
  active: PieceType
  canTake?: boolean
}): { move: Move | undefined; keep: boolean } => {
  const { color } = active
  const targetCell = boardData.board[targetRow][targetCol]
  if (!targetCell) {
    return { move: { to: [targetRow, targetCol] }, keep: true }
  }
  const targetPiece = boardData.pieces.find(piece => piece.id === targetCell)
  return {
    move: canTake && targetPiece?.color !== color ? { to: [targetRow, targetCol], tookPiece: true } : undefined,
    keep: false
  }
}

const getPawnMoves = (boardData: BoardData, active: PieceType, onlyTakenMove = false): Move[] => {
  const { color, position } = active
  if (!position) return []

  const moves: Move[] = []
  const lastMove = boardData.history[boardData.history.length - 1]

  const [checkPos, checkPosNext, checkPosEnPassantLeft, checkPosEnPassantRight, direction] =
    color === 'white'
      ? [() => position[0] > 0, () => position[0] === 6, () => position[0] === 3 && position[1] > 0, () => position[0] === 3 && position[1] < 7, -1]
      : [() => position[0] < 7, () => position[0] === 1, () => position[0] === 4 && position[1] > 0, () => position[0] === 4 && position[1] < 7, 1]

  if (checkPos()) {
    if (!onlyTakenMove) {
      const check = getMoveIfFree({
        boardData,
        active,
        targetRow: position[0] + 1 * direction,
        targetCol: position[1],
        canTake: false
      })
      if (check.move) moves.push(check.move)
      if (checkPosNext() && check.keep) {
        const checkNext = getMoveIfFree({
          boardData,
          active,
          targetRow: position[0] + 2 * direction,
          targetCol: position[1],
          canTake: false
        })
        if (checkNext.move) moves.push(checkNext.move)
      }
    }
    if (position[1] > 0) {
      const checkLeft = getMoveIfFree({
        boardData,
        active,
        targetRow: position[0] + 1 * direction,
        targetCol: position[1] - 1
      })
      if (checkLeft.move && !checkLeft.keep) moves.push(checkLeft.move)
    }

    if (position[1] < 7) {
      const checkRight = getMoveIfFree({
        boardData,
        active,
        targetRow: position[0] + 1 * direction,
        targetCol: position[1] + 1
      })
      if (checkRight.move && !checkRight.keep) moves.push(checkRight.move)
    }

    if (checkPosEnPassantLeft() && lastMove?.move === `${positionToAlgebraic([position[0], position[1] - 1])}`) {
      const checkEnPassantLeft = getMoveIfFree({
        boardData,
        active,
        targetRow: position[0] + 1 * direction,
        targetCol: position[1] - 1,
        canTake: false
      })
      if (checkEnPassantLeft.move) moves.push({ ...checkEnPassantLeft.move, tookPiece: true, enPassant: [position[0], position[1] - 1] })
    }

    if (checkPosEnPassantRight() && lastMove?.move === `${positionToAlgebraic([position[0], position[1] + 1])}`) {
      const checkEnPassantRight = getMoveIfFree({
        boardData,
        active,
        targetRow: position[0] + 1 * direction,
        targetCol: position[1] + 1,
        canTake: false
      })
      if (checkEnPassantRight.move) moves.push({ ...checkEnPassantRight.move, tookPiece: true, enPassant: [position[0], position[1] + 1] })
    }
  }
  return moves
}

const getKingMoves = (boardData: BoardData, active: PieceType, onlyTakenMove = false): Move[] => {
  const { color, position } = active
  if (!position) return []

  const moves: Move[] = []

  if (position[0] > 0 && position[1] > 0) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] - 1,
      targetCol: position[1] - 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] > 0) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] - 1,
      targetCol: position[1]
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] > 0 && position[1] < 7) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] - 1,
      targetCol: position[1] + 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[1] > 0) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0],
      targetCol: position[1] - 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[1] < 7) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0],
      targetCol: position[1] + 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] < 7 && position[1] > 0) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] + 1,
      targetCol: position[1] - 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] < 7 && position[1] < 7) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] + 1,
      targetCol: position[1] + 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] < 7) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] + 1,
      targetCol: position[1]
    })
    if (check.move) moves.push(check.move)
  }

  // queenside castling
  if (
    !onlyTakenMove &&
    boardData.castling[color].queenSide &&
    boardData.board[position[0]][0] === `${color === 'white' ? 'w' : 'b'}r1` &&
    !boardData.board[position[0]][1] &&
    !boardData.board[position[0]][2] &&
    !boardData.board[position[0]][3] &&
    !isThereChess(boardData, color, [position[0], 2]) &&
    !isThereChess(boardData, color, [position[0], 3]) &&
    !isThereChess(boardData, color, [position[0], 4])
  ) {
    moves.push({ to: [position[0], 2], castling: true })
  }

  // kingside castling
  if (
    !onlyTakenMove &&
    boardData.castling[color].kingSide &&
    !boardData.board[position[0]][5] &&
    !boardData.board[position[0]][6] &&
    boardData.board[position[0]][7] === `${color === 'white' ? 'w' : 'b'}r2` &&
    !isThereChess(boardData, color, [position[0], 4]) &&
    !isThereChess(boardData, color, [position[0], 5]) &&
    !isThereChess(boardData, color, [position[0], 6])
  ) {
    moves.push({ to: [position[0], 6], castling: true })
  }
  return moves
}

const getRookMoves = (boardData: BoardData, active: PieceType, onlyTakenMove = false): Move[] => {
  const { position } = active
  if (!position) return []

  const moves: Move[] = []

  for (let i = position[0] - 1; i >= 0; i--) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: i,
      targetCol: position[1]
    })
    if (check.move) moves.push(check.move)
    if (!check.keep) break
  }

  for (let i = position[0] + 1; i < 8; i++) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: i,
      targetCol: position[1]
    })
    if (check.move) moves.push(check.move)
    if (!check.keep) break
  }

  for (let i = position[1] - 1; i >= 0; i--) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0],
      targetCol: i
    })
    if (check.move) moves.push(check.move)
    if (!check.keep) break
  }

  for (let i = position[1] + 1; i < 8; i++) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0],
      targetCol: i
    })
    if (check.move) moves.push(check.move)
    if (!check.keep) break
  }
  return moves
}

const getBishopMoves = (boardData: BoardData, active: PieceType, onlyTakenMove = false): Move[] => {
  const { color, position } = active
  if (!position) return []

  const moves: Move[] = []

  for (let i = position[0] - 1; i >= 0; i--) {
    if (position[1] - (position[0] - i) >= 0) {
      const check = getMoveIfFree({
        boardData,
        active,
        targetRow: i,
        targetCol: position[1] - (position[0] - i)
      })
      if (check.move) moves.push(check.move)
      if (!check.keep) break
    }
  }
  for (let i = position[0] - 1; i >= 0; i--) {
    if (position[1] + (position[0] - i) < 8) {
      const check = getMoveIfFree({
        boardData,
        active,
        targetRow: i,
        targetCol: position[1] + (position[0] - i)
      })
      if (check.move) moves.push(check.move)
      if (!check.keep) break
    }
  }

  for (let i = position[0] + 1; i < 8; i++) {
    if (position[1] - (position[0] - i) >= 0) {
      const check = getMoveIfFree({
        boardData,
        active,
        targetRow: i,
        targetCol: position[1] - (position[0] - i)
      })
      if (check.move) moves.push(check.move)
      if (!check.keep) break
    }
  }
  for (let i = position[0] + 1; i < 8; i++) {
    if (position[1] + (position[0] - i) < 8) {
      const check = getMoveIfFree({
        boardData,
        active,
        targetRow: i,
        targetCol: position[1] + (position[0] - i)
      })
      if (check.move) moves.push(check.move)
      if (!check.keep) break
    }
  }

  return moves
}

const getQueenMoves = (boardData: BoardData, active: PieceType, onlyTakenMove = false): Move[] => {
  return [...getRookMoves(boardData, active), ...getBishopMoves(boardData, active)]
}

const getKnightMoves = (boardData: BoardData, active: PieceType, onlyTakenMove = false): Move[] => {
  const { color, position } = active
  if (!position) return []

  const moves: Move[] = []

  if (position[0] > 1 && position[1] > 0) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] - 2,
      targetCol: position[1] - 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] > 1 && position[1] < 7) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] - 2,
      targetCol: position[1] + 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] < 6 && position[1] > 0) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] + 2,
      targetCol: position[1] - 1
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] < 6 && position[1] < 7) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] + 2,
      targetCol: position[1] + 1
    })
    if (check.move) moves.push(check.move)
  }

  if (position[0] > 0 && position[1] > 1) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] - 1,
      targetCol: position[1] - 2
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] < 7 && position[1] > 1) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] + 1,
      targetCol: position[1] - 2
    })
    if (check.move) moves.push(check.move)
  }

  if (position[0] > 0 && position[1] < 6) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] - 1,
      targetCol: position[1] + 2
    })
    if (check.move) moves.push(check.move)
  }
  if (position[0] < 7 && position[1] < 6) {
    const check = getMoveIfFree({
      boardData,
      active,
      targetRow: position[0] + 1,
      targetCol: position[1] + 2
    })
    if (check.move) moves.push(check.move)
  }
  return moves
}

const getPiecesMoves = (boardData: BoardData, active: PieceType, onlyTakenMove = false): Move[] => {
  switch (active.type) {
    case 'pawn':
      return getPawnMoves(boardData, active, onlyTakenMove)
    case 'king':
      return getKingMoves(boardData, active, onlyTakenMove)
    case 'queen':
      return getQueenMoves(boardData, active, onlyTakenMove)
    case 'rook':
      return getRookMoves(boardData, active, onlyTakenMove)
    case 'knight':
      return getKnightMoves(boardData, active, onlyTakenMove)
    case 'bishop':
      return getBishopMoves(boardData, active, onlyTakenMove)
  }
}

const isThereChess = (boardData: BoardData, color: 'white' | 'black', posToCheck?: [number, number]) => {
  const kingPos = posToCheck ?? boardData.pieces.find(piece => piece.id === `${color === 'white' ? 'w' : 'b'}king`)?.position
  if (!kingPos) return false
  const ennemyPieces = boardData.pieces.filter(piece => piece.color === (color === 'white' ? 'black' : 'white'))
  for (const piece of ennemyPieces) {
    const pieceMoves = getPiecesMoves(boardData, piece, true)
    for (const ennemyMove of pieceMoves) {
      if (ennemyMove.to[0] === kingPos[0] && ennemyMove.to[1] === kingPos[1]) return true
    }
  }
  return false
}

const getMovesWithoutChessMate = ({
  boardData: { board, pieces, history, castling },
  active,
  moves
}: {
  boardData: BoardData
  active: PieceType
  moves: Move[]
}): Move[] => {
  const movesWithoutChessMate: Move[] = []
  for (const move of moves) {
    const simulatedBoard = moveCell({
      board,
      newPosition: move.to,
      currentActive: active,
      enPassant: move.enPassant
    })
    const simulatedPieces = pieces.map(piece => {
      if (piece.id === active.id) {
        return { ...piece, position: move.to }
      }
      if (piece.position?.[0] === move.to[0] && piece.position?.[1] === move.to[1]) {
        return { ...piece, position: null }
      }
      return piece
    })

    const simulatedBoardData = {
      board: simulatedBoard,
      pieces: simulatedPieces,
      history,
      castling
    }
    if (!isThereChess(simulatedBoardData, active.color)) {
      movesWithoutChessMate.push(move)
    }
  }
  return movesWithoutChessMate
}

export const getDroppableCells = ({
  boardData,
  active
}: {
  boardData: BoardData
  active: PieceType
}): Move[] => {
  const moves = getPiecesMoves(boardData, active)
  const movesWithoutChessMate = getMovesWithoutChessMate({
    boardData,
    active,
    moves
  })
  return movesWithoutChessMate
}

// Conversion entre indices et notation des colonnes (e.g., 0 -> 'a', 7 -> 'h')
const positionToAlgebraic = ([row, col]: [number, number]): string => {
  return String.fromCharCode(97 + col) + (8 - row)
}

// Fonction d'encodage en notation algébrique
export const encodeToAlgebraicNotation = (item: HistoryItem): string => {
  // Détection du type de coup
  const piece = PIECES.find(p => p.id === item.pieceId)
  let moveNotation = ''

  if (!piece) throw new Error('Piece not found')

  // Cas du roque
  if (item.castling) {
    if (item.to.position[1] === 6) return 'O-O' // Petit roque
    if (item.to.position[1] === 2) return 'O-O-O' // Grand roque
  }

  // Ajout du type de pièce (sauf pour les pions)
  if (piece.type !== 'pawn') {
    moveNotation += (piece.type === 'knight' ? 'n' : piece.type[0]).toUpperCase()
  }

  // Si une pièce est capturée
  if (item.tookPiece) {
    if (piece.type === 'pawn') {
      // Pour les pions qui prennent, il faut préciser la colonne de départ
      moveNotation += String.fromCharCode(97 + item.from.position[1])
    }
    moveNotation += 'x'
  }

  // Ajout de la position finale
  moveNotation += positionToAlgebraic(item.to.position)

  // Si c'est une prise en passant
  if (item.enPassant) {
    moveNotation += ' e.p.' // Indique une prise en passant
  }

  // Si promotion
  if (item.promotion) {
    moveNotation += `=${item.promotion[0].toUpperCase()}`
  }

  return moveNotation
}
