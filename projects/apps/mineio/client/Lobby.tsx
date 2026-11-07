import { ActionIcon, Button, Group, Menu, Paper, SegmentedControl, SimpleGrid, Slider, Stack, Switch, Text, Title } from '@mantine/core'
import type { User } from '@platform/model'
import { IconPlayerPlay, IconRobot, IconUser, IconX } from '@tabler/icons-react'
import {
  BOT_LEVEL_LABELS,
  BOT_LEVELS,
  CHORDING_DESCRIPTION,
  DENSITY,
  DIAGONALS,
  DIAGONALS_LABELS,
  GRID_PRESET_KEYS,
  GRID_PRESETS,
  SEAT_LABELS
} from '@yorab/mine.io/engine'
import { SeatSwatch, seatColor } from '@yorab/mine.io/react'
import { useEffect, useState } from 'react'
import type { Lobby } from '../server/types'
import { trpc } from './trpc'

// the corners as they sit on the grid: top left, top right, then bottom left, bottom right
const CORNERS = [0, 1, 3, 2]

type LobbyProps = { boardId: string; lobby: Lobby; user: User }

const SeatCard = ({ boardId, lobby, user, seat }: LobbyProps & { seat: number }) => {
  const entry = lobby.seats[seat] ?? null
  const isOwner = lobby.ownerId === user.id
  const seated = lobby.seats.some(other => other?.kind === 'human' && other.userId === user.id)
  const takeSeat = trpc.mineio.takeSeat.useMutation()
  const leaveSeat = trpc.mineio.leaveSeat.useMutation()
  const addBot = trpc.mineio.addBot.useMutation()
  const removeBot = trpc.mineio.removeBot.useMutation()

  return (
    <Paper withBorder p='sm' style={entry ? { borderColor: seatColor(seat) } : undefined}>
      <Group gap='xs'>
        <SeatSwatch seat={seat} />
        <Text size='xs' c='dimmed' tt='uppercase' fw={700}>
          {SEAT_LABELS[seat]}
        </Text>
      </Group>
      {entry === null ? (
        <Group gap='xs' mt='xs'>
          <Button size='xs' variant='light' loading={takeSeat.isPending} onClick={() => takeSeat.mutate({ boardId, seat })}>
            {seated ? 'Move here' : 'Take this corner'}
          </Button>
          {isOwner && (
            <Menu position='bottom-start'>
              <Menu.Target>
                <Button size='xs' variant='default' leftSection={<IconRobot size={14} />}>
                  Add a bot
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {BOT_LEVELS.map(level => (
                  <Menu.Item key={level} onClick={() => addBot.mutate({ boardId, seat, level })}>
                    {BOT_LEVEL_LABELS[level]}
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
              {entry.name}
              {entry.kind === 'human' && entry.userId === user.id ? ' (you)' : ''}
            </Text>
          </Group>
          {entry.kind === 'human' && entry.userId === user.id && (
            <Button size='xs' variant='subtle' color='gray' onClick={() => leaveSeat.mutate({ boardId })}>
              Leave
            </Button>
          )}
          {entry.kind === 'bot' && isOwner && (
            <ActionIcon variant='subtle' color='gray' aria-label='Remove this bot' onClick={() => removeBot.mutate({ boardId, seat })}>
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      )}
    </Paper>
  )
}

const Settings = ({ boardId, lobby, user }: LobbyProps) => {
  const isOwner = lobby.ownerId === user.id
  const update = trpc.mineio.updateSettings.useMutation()
  const percent = Math.round(lobby.settings.density * 100)
  // the slider moves locally and is only sent when released
  const [density, setDensity] = useState(percent)
  useEffect(() => setDensity(percent), [percent])

  return (
    <Paper withBorder p='md'>
      <Stack gap='sm'>
        <div>
          <Text size='sm' fw={500} mb={4}>
            Grid
          </Text>
          <SegmentedControl
            fullWidth
            disabled={!isOwner}
            data={GRID_PRESET_KEYS.map(key => ({
              value: key,
              label: `${GRID_PRESETS[key].label} ${GRID_PRESETS[key].cols}×${GRID_PRESETS[key].rows}`
            }))}
            value={lobby.settings.preset}
            onChange={preset => update.mutate({ boardId, preset })}
          />
        </div>
        <div>
          <Text size='sm' fw={500} mb={4}>
            Mines: {density}%
          </Text>
          <Slider
            disabled={!isOwner}
            min={DENSITY.min * 100}
            max={DENSITY.max * 100}
            step={1}
            value={density}
            label={value => `${value}%`}
            onChange={setDensity}
            onChangeEnd={value => update.mutate({ boardId, density: value / 100 })}
          />
        </div>
        <div>
          <Text size='sm' fw={500} mb={4}>
            Diagonals
          </Text>
          <SegmentedControl
            fullWidth
            disabled={!isOwner}
            data={DIAGONALS.map(value => ({ value, label: DIAGONALS_LABELS[value].label }))}
            value={lobby.settings.diagonals}
            onChange={diagonals => update.mutate({ boardId, diagonals })}
          />
          <Text size='xs' c='dimmed' mt={4}>
            {DIAGONALS_LABELS[lobby.settings.diagonals].description}
          </Text>
        </div>
        <Switch
          label='Chording'
          description={CHORDING_DESCRIPTION}
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
  const isOwner = lobby.ownerId === user.id
  const players = lobby.seats.filter(Boolean).length
  const start = trpc.mineio.start.useMutation()

  return (
    <Stack gap='md' w='100%' maw={720} mx='auto'>
      <div>
        <Title order={3}>Mine.io</Title>
        <Text c='dimmed' size='sm'>
          Real-time territory minesweeper: reveal cells from your corner, close zones (they become yours), build a lead nobody can catch up with. A
          mine stuns you for 5 seconds.
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
          {players < 2 ? 'Two players needed (add a bot)' : 'Start the game'}
        </Button>
      ) : (
        <Text c='dimmed' ta='center'>
          Waiting for the owner of the board to start the game…
        </Text>
      )}
    </Stack>
  )
}
