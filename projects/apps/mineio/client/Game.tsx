import { Button, Group, Menu, Paper, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { useThrottledCallback } from '@mantine/hooks'
import type { User } from '@platform/model'
import { IconChevronDown, IconPlayerStop, IconRefresh } from '@tabler/icons-react'
import { END_REASON_LABELS, rankSeats } from '@yorab/mine.io/engine'
import { MineBoard, Scoreboard, SeatSwatch, useBoardStore, useTouchDevice } from '@yorab/mine.io/react'
import type { Lobby } from '../server/types'
import classes from './Game.module.css'
import { trpc } from './trpc'

type GameProps = { boardId: string; lobby: Lobby; user: User }

const FILL = { position: 'absolute', inset: 0 } as const

const Result = ({ boardId, lobby, user }: GameProps) => {
  const view = useBoardStore(state => state.view)
  const me = useBoardStore(state => state.me)
  const backToLobby = trpc.mineio.backToLobby.useMutation()
  if (view?.status !== 'ended') return null

  const total = view.cols * view.rows
  const title = view.winner === null ? 'Tie!' : view.winner === me ? 'You win!' : `${view.seats[view.winner]?.name ?? 'Someone'} wins`
  const reason = view.endReason ? END_REASON_LABELS[view.endReason] : null

  return (
    <Paper withBorder p='sm'>
      <Group justify='space-between' align='flex-start'>
        <Stack gap={4}>
          <Text fw={700} size='lg'>
            {title}
          </Text>
          <Text size='sm' c='dimmed'>
            {reason}
          </Text>
          <Group gap='md'>
            {rankSeats(view.seats, view.scores).map(({ seat, score }, rank) => (
              <Group key={seat} gap={6} wrap='nowrap'>
                <Text size='sm' fw={700}>
                  {rank + 1}.
                </Text>
                <SeatSwatch seat={seat} />
                <Text size='sm'>
                  {view.seats[seat]?.name} · {((score / total) * 100).toFixed(1)}%
                </Text>
              </Group>
            ))}
          </Group>
        </Stack>
        {lobby.ownerId === user.id ? (
          <Button leftSection={<IconRefresh size={16} />} loading={backToLobby.isPending} onClick={() => backToLobby.mutate({ boardId })}>
            Play again
          </Button>
        ) : (
          <Text size='sm' c='dimmed'>
            The owner can start another game.
          </Text>
        )}
      </Group>
    </Paper>
  )
}

/** A game in progress (or just over): the grid, the scores, and for the owner a way back to the lobby */
export const GameView = (props: GameProps) => {
  const { boardId, lobby, user } = props
  const me = useBoardStore(state => state.me)
  const playing = useBoardStore(state => state.view?.status === 'playing')
  const colorScheme = useComputedColorScheme('light')
  const touch = useTouchDevice()
  const reveal = trpc.mineio.reveal.useMutation()
  // a lost hover is not worth a notification
  const hover = trpc.mineio.hover.useMutation({ meta: { handlesError: true } })
  const backToLobby = trpc.mineio.backToLobby.useMutation()
  const chord = (verb: string) => (lobby.settings.chording ? ` · ${verb} a number: reveal around it` : '')
  const sendHover = useThrottledCallback((cell: number | null) => hover.mutate({ boardId, cell }), 120)

  return (
    <div className={classes.game}>
      <Group justify='space-between' align='flex-start' wrap='nowrap' gap='md'>
        <Scoreboard className={classes.scores} />
        {lobby.ownerId === user.id && playing && (
          <Menu position='bottom-end'>
            <Menu.Target>
              <Button size='xs' variant='default' rightSection={<IconChevronDown size={14} />}>
                Game
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item color='red' leftSection={<IconPlayerStop size={16} />} onClick={() => backToLobby.mutate({ boardId })}>
                Stop and go back to the lobby
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
      <Result {...props} />
      <div className={classes.board}>
        {/* absolute: the height of the container comes from flex and min-height, which a percentage height cannot follow */}
        <MineBoard
          style={FILL}
          onReveal={cell => reveal.mutate({ boardId, cell })}
          onHover={me === null ? undefined : sendHover}
          chording={lobby.settings.chording}
          colorScheme={colorScheme}
        />
      </div>
      <Text size='xs' c='dimmed' ta='center'>
        {me === null
          ? 'You are watching this game.'
          : touch
            ? `Tap: reveal · long press: flag (only for you)${chord('tap')} · drag, pinch: move, zoom`
            : `Click: reveal · right click: flag (only for you)${chord('click')} · drag, wheel: move, zoom`}
      </Text>
    </div>
  )
}
