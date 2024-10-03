import React, { useState } from 'react'
import Cell from './Cell'
import './ChessBoard.css'
import type { ChessGame, PieceType, PieceTypeType } from '@common/chess'
import type { Session, User } from '@common/model'
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core'
import Loading from '@front/components/Loading'
import { trpc } from '@front/utils/trpc'
import Piece from './Piece'

const ChessBoard = ({ user, session, boardId }: { user: User; session: Session; boardId: string }) => {
  const [shallPromote, setShallPromote] = useState<{ pieceId: string; position: [number, number] } | undefined>(undefined)
  const [boardData, setBoardData] = useState<ChessGame>()
  const [dragDatas, setDragDatas] = useState<{
    active: PieceType | undefined
    enabledCells: [number, number][]
    withDropAnim: boolean
  }>({
    active: undefined,
    withDropAnim: true,
    enabledCells: []
  })

  trpc.protected.watchChessGame.useSubscription(
    { boardId },
    {
      onData(data) {
        console.log('received dataaaa !', data)
        data && setBoardData(data)
      },
      onError(err) {
        console.error('Subscription error:', err)
      }
    }
  )

  const movePieceMutation = trpc.protected.movePiece.useMutation({
    onSuccess: data => {
      console.log('piece moved', data)
    }
  })

  const addPlayerMutation = trpc.protected.addPlayer.useMutation({
    onSuccess: data => {
      console.log('addPlayer', data)
    }
  })

  const giveUpMutation = trpc.protected.giveUp.useMutation({
    onSuccess: data => {
      console.log('giveUp', data)
    }
  })

  const handleBoardClick = () => {
    setDragDatas({
      active: undefined,
      withDropAnim: true,
      enabledCells: []
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const active = boardData?.pieces.find(piece => piece.id === event.active.id)
    if (!active || !boardData) return
    setDragDatas({
      active,
      withDropAnim: true,
      enabledCells: boardData.droppableCells[active.id]
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event
    const currentActive = dragDatas.active
    if (!currentActive || !over) return

    setDragDatas({
      active: undefined,
      withDropAnim: false,
      enabledCells: []
    })

    const pieceId = currentActive.id
    const newPosition = (over.data.current as any).position

    const piece = boardData?.pieces.find(piece => piece.id === pieceId)
    if (piece?.type === 'pawn' && newPosition[0] % 7 === 0) {
      setShallPromote({ pieceId, position: newPosition })
    } else {
      movePieceMutation.mutate({ boardId, pieceId, newPosition })
    }
  }

  const choosePromotion = (type: 'queen' | 'rook' | 'bishop' | 'knight') => {
    if (!shallPromote) return
    movePieceMutation.mutate({ boardId, pieceId: shallPromote.pieceId, newPosition: shallPromote.position, promotion: type })
    setShallPromote(undefined)
  }

  const giveUp = () => {
    giveUpMutation.mutate({ boardId })
  }

  const handleDropOnCell = (row: number, col: number) => {
    const currentActive = dragDatas.active
    if (!currentActive) return
    const newPosition = [row, col] as [number, number]

    setDragDatas({
      active: undefined,
      withDropAnim: true,
      enabledCells: []
    })
    movePieceMutation.mutate({ boardId, pieceId: currentActive.id, newPosition })
  }

  const onJoinGame = (color: 'white' | 'black') => {
    addPlayerMutation.mutate({ boardId, color })
  }

  const userColor = boardData?.players.white?.id === user.id ? 'white' : boardData?.players.black?.id === user.id ? 'black' : undefined

  const needPlayer = boardData?.players.white === undefined || boardData?.players.black === undefined

  if (!boardData) return <Loading />
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className='ChessBoard'>
        <div
          className={`ChessBoardContainer${dragDatas.active ? ' isdragging' : ''}${userColor === 'black' ? ' isBlack' : ''}`}
          onClick={handleBoardClick}
        >
          <div className='Board'>
            {boardData.board.map((boardRow, rowIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={rowIndex} className='Row'>
                {boardRow.map((boardCell, colIndex) => {
                  const id = `${rowIndex}-${colIndex}`
                  const piece = boardCell && !needPlayer ? boardData.pieces.find(piece => piece.id === boardCell) : undefined
                  const dropEnabled = !!dragDatas.enabledCells.find(cell => cell[0] === rowIndex && cell[1] === colIndex)
                  const isSelected = !!(dragDatas.active && dragDatas.active?.id === piece?.id)
                  return (
                    <Cell
                      key={id}
                      id={id}
                      col={colIndex}
                      row={rowIndex}
                      piece={piece}
                      dropEnabled={dropEnabled}
                      isSelected={isSelected}
                      handleDropOnCell={handleDropOnCell}
                      playerTurn={boardData.playerTurn}
                      userColor={userColor}
                      isGameEnded={!!boardData.endedAt}
                    />
                  )
                })}
              </div>
            ))}

            {needPlayer && (
              <div className='modal is-active localModal'>
                <div className='modal-background' />
                <div className='modal-card'>
                  <section className='modal-card-body'>
                    {userColor ? (
                      "En attente d'un joueur"
                    ) : (
                      <>
                        <button className='button' type='button' onClick={() => onJoinGame('white')} disabled={!!boardData.players.white}>
                          Jouer les blancs
                        </button>
                        <button className='button' type='button' onClick={() => onJoinGame('black')} disabled={!!boardData.players.black}>
                          Jouer les noirs
                        </button>
                      </>
                    )}
                  </section>
                </div>
              </div>
            )}

            {shallPromote && (
              <div className='modal localModal is-active'>
                <div className='modal-background' />
                <div className='modal-card'>
                  <header className='modal-card-head'>
                    <p className='modal-card-title'>Promotion d'un pion</p>
                  </header>
                  <section className='modal-card-body'>Choisissez une pièce en laquelle promouvoir votre pion</section>
                  <footer className='modal-card-foot'>
                    <div className='buttons'>
                      {(['queen', 'rook', 'bishop', 'knight'] as const).map(piece => (
                        <button key={piece} type='button' className='button' onClick={() => choosePromotion(piece)}>
                          <Piece piece={{ type: piece, color: userColor! }} />
                        </button>
                      ))}
                    </div>
                  </footer>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='LostPieces'>
          {boardData.pieces
            .filter(piece => piece.position === null)
            .map(piece => {
              return <Piece key={piece.id} piece={piece} />
            })}
        </div>
        <div className='history'>
          {!boardData.endedAt && boardData.startedAt && !!userColor && (
            <button type='button' className='button' onClick={giveUp}>
              Abandonner
            </button>
          )}
          <ul>
            {boardData.history.flatMap((move, index) => {
              if (index % 2 === 0) {
                const blackMove = boardData.history[index + 1]?.move ?? ''
                return (
                  <li key={move.time}>
                    {index / 2 + 1}. {move.move} {blackMove}
                  </li>
                )
              }
              return []
            })}
            {boardData.result === 'pat' ? (
              <li>Pat</li>
            ) : boardData.result === 'win' ? (
              <li>Victoire de {boardData.winner?.pseudo}</li>
            ) : boardData.result === 'giveup' ? (
              <>
                <li>
                  Abandon de{' '}
                  {boardData.players.black?.id === boardData.winner?.id ? boardData.players.white?.pseudo : boardData.players.black?.pseudo}
                </li>
                <li>Victoire de {boardData.winner?.pseudo}</li>
              </>
            ) : null}
          </ul>
        </div>
        <DragOverlay className='DragOverlay' dropAnimation={dragDatas.withDropAnim ? undefined : null}>
          {dragDatas.active && <Piece piece={dragDatas.active} isOverlay={true} />}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default ChessBoard
