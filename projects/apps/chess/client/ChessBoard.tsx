import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core'
import { ActionIcon, Alert, Button, Group, Overlay, Paper, Popover, ScrollArea, Stack, Table, Text, Title } from '@mantine/core'
import { type AppProps, Loading, useTranslation } from '@platform/client'
import { IconFlag, IconTrophy } from '@tabler/icons-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { type ChessGame, type PieceType, PROMOTIONS } from '../shared/types'
import Cell from './Cell'
import classes from './ChessBoard.module.css'
import Piece from './Piece'
import PlayerStrip from './PlayerStrip'
import { trpc } from './trpc'

// a dialog confined to the board itself (not a full Mantine Modal: both choices below are mandatory, nothing to dismiss)
const BoardOverlay = ({ children }: { children: ReactNode }) => (
  <Overlay center blur={2} radius='md' backgroundOpacity={0.45}>
    <Paper p='lg' shadow='md' miw={260}>
      {children}
    </Paper>
  </Overlay>
)

/** How the game ended, above the moves */
const GameResult = ({ game }: { game: ChessGame }) => {
  const { t } = useTranslation('chess')
  if (game.result === 'pat') {
    return (
      <Alert color='gray' title={t('result.stalemate')}>
        {t('result.draw')}
      </Alert>
    )
  }
  if (game.result === 'win' || game.result === 'giveup') {
    const loser = game.players.black?.id === game.winner?.id ? game.players.white : game.players.black
    return (
      <Alert color='teal' icon={<IconTrophy />} title={t('result.wins', { name: game.winner?.pseudo ?? t('result.someone') })}>
        {game.result === 'giveup' ? t('result.resigned', { name: loser?.pseudo ?? t('result.theOpponent') }) : t('result.checkmate')}
      </Alert>
    )
  }
  return null
}

/** The moves, one row per pair (white, black), scrolled to the last one */
const MoveList = ({ history }: { history: ChessGame['history'] }) => {
  const { t } = useTranslation('chess')
  const viewport = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (history.length) viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' })
  }, [history.length])

  if (history.length === 0) {
    return (
      <Text size='sm' c='dimmed'>
        {t('moves.none')}
      </Text>
    )
  }
  return (
    <ScrollArea flex={1} mih={0} viewportRef={viewport}>
      <Table striped withRowBorders={false} verticalSpacing={4} fz='sm'>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={36}>#</Table.Th>
            <Table.Th>{t('moves.white')}</Table.Th>
            <Table.Th>{t('moves.black')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {/* one row per pair: white's move, then black's if it has been played */}
          {Array.from({ length: Math.ceil(history.length / 2) }, (_, pair) => (
            <Table.Tr key={history[2 * pair]?.time}>
              <Table.Td c='dimmed'>{pair + 1}.</Table.Td>
              <Table.Td>{history[2 * pair]?.move}</Table.Td>
              <Table.Td>{history[2 * pair + 1]?.move}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}

/** Resigning asks for a confirmation: one misclick would end the game */
const ResignButton = ({ onConfirm, loading }: { onConfirm: () => void; loading: boolean }) => {
  const { t } = useTranslation('chess')
  const [opened, setOpened] = useState(false)
  return (
    <Popover opened={opened} onChange={setOpened} position='bottom' withArrow shadow='md'>
      <Popover.Target>
        <Button color='red' variant='light' leftSection={<IconFlag size={16} />} loading={loading} onClick={() => setOpened(value => !value)}>
          {t('resign.button')}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size='sm' mb='xs'>
          {t('resign.confirm')}
        </Text>
        <Group gap='xs' justify='flex-end'>
          <Button size='xs' variant='default' onClick={() => setOpened(false)}>
            {t('resign.cancel')}
          </Button>
          <Button
            size='xs'
            color='red'
            onClick={() => {
              setOpened(false)
              onConfirm()
            }}
          >
            {t('resign.button')}
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}

const ChessBoard = ({ user, room, boardId }: AppProps) => {
  const { t } = useTranslation('chess')
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
        data && setBoardData(data)
      },
      onError(err) {
        console.error('Subscription error:', err)
      }
    }
  )

  const movePieceMutation = trpc.chess.movePiece.useMutation()
  const addPlayerMutation = trpc.chess.addPlayer.useMutation()
  const giveUpMutation = trpc.chess.giveUp.useMutation()

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

  // the user plays from the bottom of the board (white for a spectator)
  const bottomColor = userColor ?? 'white'
  const topColor = bottomColor === 'white' ? 'black' : 'white'
  // startedAt is only set by the first move (and the server refuses to resign before it)
  const canResign = !!userColor && !!boardData.startedAt && !boardData.endedAt
  const strip = (color: PieceType['color']) => (
    <PlayerStrip
      player={boardData.players[color]}
      color={color}
      captured={boardData.pieces.filter(piece => piece.position === null && piece.color !== color)}
      active={!needPlayer && !boardData.endedAt && boardData.playerTurn === color}
      isMe={userColor === color}
    />
  )

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={classes.chessBoard}>
        <div className={classes.play}>
          <div className={classes.layout}>
            <div className={classes.column}>
              {strip(topColor)}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: click-to-move complements drag and drop, which is pointer-only */}
              <div className={classes.board} data-black={userColor === 'black' || undefined} onClick={handleBoardClick}>
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
                      <Text ta='center'>{t('setup.waiting')}</Text>
                    ) : isOwner && modeSelection.isMulti === undefined ? (
                      <Stack gap='sm'>
                        <Button onClick={() => setModeSelection({ isMulti: true })}>{t('setup.vsHuman')}</Button>
                        {readyAIs?.map(readyAI => (
                          <Button key={readyAI.id} variant='light' onClick={() => setModeSelection({ isMulti: false, ai: readyAI.id })}>
                            {t('setup.vsAI', { name: readyAI.pseudo })}
                          </Button>
                        ))}
                      </Stack>
                    ) : (
                      <Group justify='center' gap='sm'>
                        <Button variant='default' onClick={() => onJoinGame('white')} disabled={!!boardData.players.white}>
                          {t('setup.playWhite')}
                        </Button>
                        <Button color='dark' onClick={() => onJoinGame('black')} disabled={!!boardData.players.black}>
                          {t('setup.playBlack')}
                        </Button>
                      </Group>
                    )}
                  </BoardOverlay>
                )}

                {shallPromote && (
                  <BoardOverlay>
                    <Stack gap='sm' align='center'>
                      <Title order={4}>{t('promotion.title')}</Title>
                      <Text size='sm'>{t('promotion.hint')}</Text>
                      <Group gap='sm'>
                        {PROMOTIONS.map(piece => (
                          <ActionIcon
                            key={piece}
                            variant='default'
                            size={64}
                            aria-label={t(`pieces.${piece}`)}
                            onClick={() => choosePromotion(piece)}
                          >
                            <Piece piece={{ type: piece, color: userColor! }} />
                          </ActionIcon>
                        ))}
                      </Group>
                    </Stack>
                  </BoardOverlay>
                )}
              </div>
              {strip(bottomColor)}
            </div>
            <Paper withBorder p='sm' className={classes.panel}>
              <Group justify='space-between' mih={30}>
                <Text fw={600}>{t('moves.title')}</Text>
                {canResign && <ResignButton onConfirm={() => giveUpMutation.mutate({ boardId })} loading={giveUpMutation.isPending} />}
              </Group>
              <GameResult game={boardData} />
              <MoveList history={boardData.history} />
            </Paper>
          </div>
        </div>
        <DragOverlay className={classes.dragOverlay} dropAnimation={dragDatas.withDropAnim ? undefined : null}>
          {dragDatas.active && <Piece piece={dragDatas.active} isOverlay={true} />}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default ChessBoard
