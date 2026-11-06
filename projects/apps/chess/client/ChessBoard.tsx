import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core'
import { ActionIcon, Button, Group, List, Overlay, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { type AppProps, Loading } from '@platform/client'
import { type ReactNode, useState } from 'react'
import { type ChessGame, type PieceType, PROMOTIONS } from '../shared/types'
import Cell from './Cell'
import classes from './ChessBoard.module.css'
import Piece from './Piece'
import { trpc } from './trpc'

// a dialog confined to the board itself (not a full Mantine Modal: both choices below are mandatory, nothing to dismiss)
const BoardOverlay = ({ children }: { children: ReactNode }) => (
  <Overlay center blur={2} radius='md' backgroundOpacity={0.45}>
    <Paper p='lg' shadow='md' miw={260}>
      {children}
    </Paper>
  </Overlay>
)

const ChessBoard = ({ user, room, boardId }: AppProps) => {
  const [modeSelection, setModeSelection] = useState<{ isMulti: boolean | undefined; ai?: string | undefined }>({ isMulti: undefined })
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

  const isOwner = user.id === room.owner?.id

  const readyAIsQuery = trpc.chess.findReadyAIs.useQuery()
  const readyAIs = readyAIsQuery.data

  trpc.chess.watchChessGame.useSubscription(
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

  const movePieceMutation = trpc.chess.movePiece.useMutation({
    onSuccess: data => {
      console.log('piece moved', data)
    }
  })

  const addPlayerMutation = trpc.chess.addPlayer.useMutation({
    onSuccess: data => {
      console.log('addPlayer', data)
    }
  })

  const giveUpMutation = trpc.chess.giveUp.useMutation({
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
    const newPosition = over.data.current?.position

    const piece = boardData?.pieces.find(piece => piece.id === pieceId)
    if (piece?.type === 'pawn' && newPosition[0] % 7 === 0) {
      setShallPromote({ pieceId, position: newPosition })
    } else {
      movePieceMutation.mutate({ boardId, pieceId, newPosition })
    }
  }

  const choosePromotion = (type: (typeof PROMOTIONS)[number]) => {
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
    addPlayerMutation.mutate({ boardId, color, ai: modeSelection.ai })
  }

  const userColor = boardData?.players.white?.id === user.id ? 'white' : boardData?.players.black?.id === user.id ? 'black' : undefined

  const needPlayer = boardData?.players.white === undefined || boardData?.players.black === undefined
  const needBothPlayer = boardData?.players.white === undefined && boardData?.players.black === undefined

  if (!boardData) return <Loading />
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={classes.chessBoard}>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: click-to-move complements drag and drop, which is pointer-only */}
        <div className={classes.container} data-black={userColor === 'black' || undefined} onClick={handleBoardClick}>
          <div className={classes.board}>
            {boardData.board.map((boardRow, rowIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: board rows and cells are positional and never reordered
              <div key={rowIndex} className={classes.row}>
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
              <BoardOverlay>
                {userColor || (needBothPlayer && !isOwner) ? (
                  <Text ta='center'>En attente d'un joueur</Text>
                ) : isOwner && modeSelection.isMulti === undefined ? (
                  <Stack gap='sm'>
                    <Button onClick={() => setModeSelection({ isMulti: true })}>Jouer contre un humain</Button>
                    {readyAIs?.map(readyAI => (
                      <Button key={readyAI.id} variant='light' onClick={() => setModeSelection({ isMulti: false, ai: readyAI.id })}>
                        Jouer contre {readyAI.pseudo}
                      </Button>
                    ))}
                  </Stack>
                ) : (
                  <Group justify='center' gap='sm'>
                    <Button variant='default' onClick={() => onJoinGame('white')} disabled={!!boardData.players.white}>
                      Jouer les blancs
                    </Button>
                    <Button color='dark' onClick={() => onJoinGame('black')} disabled={!!boardData.players.black}>
                      Jouer les noirs
                    </Button>
                  </Group>
                )}
              </BoardOverlay>
            )}

            {shallPromote && (
              <BoardOverlay>
                <Stack gap='sm' align='center'>
                  <Title order={4}>Promotion d'un pion</Title>
                  <Text size='sm'>Choisissez une pièce en laquelle promouvoir votre pion</Text>
                  <Group gap='sm'>
                    {PROMOTIONS.map(piece => (
                      <ActionIcon key={piece} variant='default' size={64} aria-label={piece} onClick={() => choosePromotion(piece)}>
                        <Piece piece={{ type: piece, color: userColor! }} />
                      </ActionIcon>
                    ))}
                  </Group>
                </Stack>
              </BoardOverlay>
            )}
          </div>
        </div>
        <Paper withBorder p='sm' className={classes.panel}>
          <div className={classes.lostPieces}>
            {boardData.pieces
              .filter(piece => piece.position === null)
              .map(piece => {
                return <Piece key={piece.id} piece={piece} />
              })}
          </div>
          {!boardData.endedAt && boardData.startedAt && !!userColor && (
            <Button color='red' variant='light' onClick={giveUp}>
              Abandonner
            </Button>
          )}
          <ScrollArea flex={1} mih={0}>
            <List listStyleType='none' size='sm' spacing={4}>
              {boardData.history.flatMap((move, index) => {
                if (index % 2 === 0) {
                  const blackMove = boardData.history[index + 1]?.move ?? ''
                  return (
                    <List.Item key={move.time}>
                      {index / 2 + 1}. {move.move} {blackMove}
                    </List.Item>
                  )
                }
                return []
              })}
              {boardData.result === 'pat' ? (
                <List.Item>
                  <strong>Pat</strong>
                </List.Item>
              ) : boardData.result === 'win' ? (
                <List.Item>
                  <strong>Victoire de {boardData.winner?.pseudo}</strong>
                </List.Item>
              ) : boardData.result === 'giveup' ? (
                <>
                  <List.Item>
                    <em>
                      Abandon de{' '}
                      {boardData.players.black?.id === boardData.winner?.id ? boardData.players.white?.pseudo : boardData.players.black?.pseudo}
                    </em>
                  </List.Item>
                  <List.Item>
                    <strong>Victoire de {boardData.winner?.pseudo}</strong>
                  </List.Item>
                </>
              ) : null}
            </List>
          </ScrollArea>
        </Paper>
        <DragOverlay className={classes.dragOverlay} dropAnimation={dragDatas.withDropAnim ? undefined : null}>
          {dragDatas.active && <Piece piece={dragDatas.active} isOverlay={true} />}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default ChessBoard
