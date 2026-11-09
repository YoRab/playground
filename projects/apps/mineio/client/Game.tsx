import { Button, Group, Menu, Paper, Stack, Text, useComputedColorScheme } from '@mantine/core'
import { useThrottledCallback } from '@mantine/hooks'
import { useTranslation } from '@platform/client'
import type { User } from '@platform/model'
import { IconChevronDown, IconPlayerStop, IconRefresh } from '@tabler/icons-react'
import { rankSeats } from '@yorab/mine.io/engine'
import { MineBoard, Scoreboard, SeatSwatch, useBoardStore, useTouchDevice } from '@yorab/mine.io/react'
import type { Lobby } from '../server/types'
import classes from './Game.module.css'
import { usePercent, useSeatName } from './texts'
import { trpc } from './trpc'

type GameProps = { boardId: string; lobby: Lobby; user: User }

const FILL = { position: 'absolute', inset: 0 } as const

const Result = ({ boardId, lobby, user }: GameProps) => {
  const { t } = useTranslation('mineio')
  const percent = usePercent()
  const seatName = useSeatName()
  const view = useBoardStore(state => state.view)
  const me = useBoardStore(state => state.me)
  const backToLobby = trpc.mineio.backToLobby.useMutation()
  if (view?.status !== 'ended') return null

  const total = view.cols * view.rows
  // the lobby keeps the corners during the game: a bot is named after its level
  const nameOf = (seat: number) => seatName(lobby.seats[seat]) ?? view.seats[seat]?.name
  const title =
    view.winner === null
      ? t('result.tie')
      : view.winner === me
        ? t('result.youWin')
        : t('result.wins', { name: nameOf(view.winner) ?? t('result.someone') })
  const reason = view.endReason ? t(`endReasons.${view.endReason}`) : null

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
                  {nameOf(seat)} · {percent(score / total, 1)}
                </Text>
              </Group>
            ))}
          </Group>
        </Stack>
        {lobby.ownerId === user.id ? (
          <Button leftSection={<IconRefresh size={16} />} loading={backToLobby.isPending} onClick={() => backToLobby.mutate({ boardId })}>
            {t('result.playAgain')}
          </Button>
        ) : (
          <Text size='sm' c='dimmed'>
            {t('result.ownerCanRestart')}
          </Text>
        )}
      </Group>
    </Paper>
  )
}

/** A game in progress (or just over): the grid, the scores, and for the owner a way back to the lobby */
export const GameView = (props: GameProps) => {
  const { boardId, lobby, user } = props
  const { t } = useTranslation('mineio')
  const me = useBoardStore(state => state.me)
  const playing = useBoardStore(state => state.view?.status === 'playing')
  const colorScheme = useComputedColorScheme('light')
  const touch = useTouchDevice()
  const reveal = trpc.mineio.reveal.useMutation()
  // a lost hover is not worth a notification
  const hover = trpc.mineio.hover.useMutation({ meta: { handlesError: true } })
  const backToLobby = trpc.mineio.backToLobby.useMutation()
  // how to play, for a touch screen or a mouse
  const input = touch ? 'touch' : 'mouse'
  const help = [t(`game.${input}`), ...(lobby.settings.chording ? [t(`game.${input}Chord`)] : []), t(`game.${input}Move`)]
  const sendHover = useThrottledCallback((cell: number | null) => hover.mutate({ boardId, cell }), 120)

  return (
    <div className={classes.game}>
      <Group justify='space-between' align='flex-start' wrap='nowrap' gap='md'>
        <Scoreboard className={classes.scores} />
        {lobby.ownerId === user.id && playing && (
          <Menu position='bottom-end'>
            <Menu.Target>
              <Button size='xs' variant='default' rightSection={<IconChevronDown size={14} />}>
                {t('game.menu')}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item color='red' leftSection={<IconPlayerStop size={16} />} onClick={() => backToLobby.mutate({ boardId })}>
                {t('game.stop')}
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
        {me === null ? t('game.watching') : help.join(' · ')}
      </Text>
    </div>
  )
}
