import { ActionIcon, Button, Group, Menu, Paper, SegmentedControl, SimpleGrid, Slider, Stack, Switch, Text, Title } from '@mantine/core'
import { useTranslation } from '@platform/client'
import type { User } from '@platform/model'
import { IconPlayerPlay, IconRobot, IconUser, IconX } from '@tabler/icons-react'
import { BOT_LEVELS, DENSITY, DIAGONALS, GRID_PRESET_KEYS, GRID_PRESETS } from '@yorab/mine.io/engine'
import { SeatSwatch, seatColor } from '@yorab/mine.io/react'
import { useEffect, useState } from 'react'
import type { Lobby } from '../server/types'
import { SEAT_KEYS, usePercent, useSeatName } from './texts'
import { trpc } from './trpc'

// the corners as they sit on the grid: top left, top right, then bottom left, bottom right
const CORNERS = [0, 1, 3, 2]

type LobbyProps = { boardId: string; lobby: Lobby; user: User }

const SeatCard = ({ boardId, lobby, user, seat }: LobbyProps & { seat: number }) => {
  const { t } = useTranslation('mineio')
  const seatName = useSeatName()
  const entry = lobby.seats[seat] ?? null
  const isOwner = lobby.ownerId === user.id
  const seated = lobby.seats.some(other => other?.kind === 'human' && other.userId === user.id)
  const isMe = entry?.kind === 'human' && entry.userId === user.id
  const seatKey = SEAT_KEYS[seat]
  const takeSeat = trpc.mineio.takeSeat.useMutation()
  const leaveSeat = trpc.mineio.leaveSeat.useMutation()
  const addBot = trpc.mineio.addBot.useMutation()
  const removeBot = trpc.mineio.removeBot.useMutation()

  return (
    <Paper withBorder p='sm' style={entry ? { borderColor: seatColor(seat) } : undefined}>
      <Group gap='xs'>
        <SeatSwatch seat={seat} />
        <Text size='xs' c='dimmed' tt='uppercase' fw={700}>
          {seatKey && t(`seats.${seatKey}`)}
        </Text>
      </Group>
      {entry === null ? (
        <Group gap='xs' mt='xs'>
          <Button size='xs' variant='light' loading={takeSeat.isPending} onClick={() => takeSeat.mutate({ boardId, seat })}>
            {seated ? t('lobby.moveHere') : t('lobby.takeCorner')}
          </Button>
          {isOwner && (
            <Menu position='bottom-start'>
              <Menu.Target>
                <Button size='xs' variant='default' leftSection={<IconRobot size={14} />}>
                  {t('lobby.addBot')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {BOT_LEVELS.map(level => (
                  <Menu.Item key={level} onClick={() => addBot.mutate({ boardId, seat, level })}>
                    {t(`levels.${level}`)}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      ) : (
        <Group justify='space-between' mt='xs' wrap='nowrap' mih={30}>
          <Group gap={6} wrap='nowrap' miw={0}>
            {entry.kind === 'bot' ? <IconRobot size={16} /> : <IconUser size={16} />}
            <Text fw={600} truncate>
              {isMe ? t('you', { ns: 'platform', name: entry.name }) : seatName(entry)}
            </Text>
          </Group>
          {isMe && (
            <Button size='xs' variant='subtle' color='gray' onClick={() => leaveSeat.mutate({ boardId })}>
              {t('lobby.leave')}
            </Button>
          )}
          {entry.kind === 'bot' && isOwner && (
            <ActionIcon variant='subtle' color='gray' aria-label={t('lobby.removeBot')} onClick={() => removeBot.mutate({ boardId, seat })}>
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      )}
    </Paper>
  )
}

const Settings = ({ boardId, lobby, user }: LobbyProps) => {
  const { t } = useTranslation('mineio')
  const percent = usePercent()
  const isOwner = lobby.ownerId === user.id
  const update = trpc.mineio.updateSettings.useMutation()
  const current = Math.round(lobby.settings.density * 100)
  // the slider moves locally and is only sent when released
  const [density, setDensity] = useState(current)
  useEffect(() => setDensity(current), [current])

  return (
    <Paper withBorder p='md'>
      <Stack gap='sm'>
        <div>
          <Text size='sm' fw={500} mb={4}>
            {t('settings.grid')}
          </Text>
          <SegmentedControl
            fullWidth
            disabled={!isOwner}
            data={GRID_PRESET_KEYS.map(key => ({
              value: key,
              label: `${t(`presets.${key}`)} ${GRID_PRESETS[key].cols}×${GRID_PRESETS[key].rows}`
            }))}
            value={lobby.settings.preset}
            onChange={preset => update.mutate({ boardId, preset })}
          />
        </div>
        <div>
          <Text size='sm' fw={500} mb={4}>
            {t('settings.mines', { percent: percent(density / 100) })}
          </Text>
          <Slider
            disabled={!isOwner}
            min={DENSITY.min * 100}
            max={DENSITY.max * 100}
            step={1}
            value={density}
            label={value => percent(value / 100)}
            onChange={setDensity}
            onChangeEnd={value => update.mutate({ boardId, density: value / 100 })}
          />
        </div>
        <div>
          <Text size='sm' fw={500} mb={4}>
            {t('settings.diagonals')}
          </Text>
          <SegmentedControl
            fullWidth
            disabled={!isOwner}
            data={DIAGONALS.map(value => ({ value, label: t(`diagonals.${value}.label`) }))}
            value={lobby.settings.diagonals}
            onChange={diagonals => update.mutate({ boardId, diagonals })}
          />
          <Text size='xs' c='dimmed' mt={4}>
            {t(`diagonals.${lobby.settings.diagonals}.description`)}
          </Text>
        </div>
        <Switch
          label={t('settings.chording')}
          description={t('settings.chordingDescription')}
          disabled={!isOwner}
          checked={lobby.settings.chording}
          onChange={event => update.mutate({ boardId, chording: event.currentTarget.checked })}
        />
      </Stack>
    </Paper>
  )
}

/** Before a game: everyone picks a corner, the owner adds bots, sets the grid and starts */
export const LobbyView = (props: LobbyProps) => {
  const { boardId, lobby, user } = props
  const { t } = useTranslation('mineio')
  const isOwner = lobby.ownerId === user.id
  const players = lobby.seats.filter(Boolean).length
  const start = trpc.mineio.start.useMutation()

  return (
    <Stack gap='md' w='100%' maw={720} mx='auto'>
      <div>
        <Title order={3}>{t('label')}</Title>
        <Text c='dimmed' size='sm'>
          {t('lobby.intro')}
        </Text>
      </div>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing='sm'>
        {CORNERS.map(seat => (
          <SeatCard key={seat} {...props} seat={seat} />
        ))}
      </SimpleGrid>
      <Settings {...props} />
      {isOwner ? (
        <Button
          size='md'
          leftSection={<IconPlayerPlay size={18} />}
          disabled={players < 2}
          loading={start.isPending}
          onClick={() => start.mutate({ boardId })}
        >
          {players < 2 ? t('lobby.needTwo') : t('lobby.start')}
        </Button>
      ) : (
        <Text c='dimmed' ta='center'>
          {t('lobby.waitingOwner')}
        </Text>
      )}
    </Stack>
  )
}
