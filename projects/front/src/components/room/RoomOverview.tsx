import { findClientApp } from '@front/apps'
import AppInfo from '@front/components/AppInfo'
import RelativeTime from '@front/components/RelativeTime'
import { boardLabels } from '@front/utils/boardLabels'
import { ActionIcon, Badge, Button, Card, Center, Group, Loader, SimpleGrid, Stack, Text, Title, Tooltip, UnstyledButton } from '@mantine/core'
import { UserAvatar } from '@platform/client'
import type { Board, Room, User } from '@platform/model'
import { IconArrowRight, IconPlus, IconTrash } from '@tabler/icons-react'
import AppPicker from './AppPicker'
import type { OwnerActions } from './BoardTabs'
import classes from './Room.module.css'

type RoomOverviewProps = {
  room: Room
  user: User
  onOpen: (boardId: string) => void
  /** Given to the owner only */
  owner?: OwnerActions | undefined
}

/** A room without a board: the owner picks the first app, the others wait for them */
const NoBoard = ({ room, owner }: { room: Room; owner?: OwnerActions | undefined }) =>
  owner ? (
    <Stack gap='md'>
      <Text c='dimmed' size='sm'>
        Pick an app to add the first board: everyone in the room will see it.
      </Text>
      <AppPicker onPick={owner.onPick} disabled={owner.adding} />
    </Stack>
  ) : (
    <Center py='xl'>
      <Stack align='center' gap='sm'>
        <Loader type='dots' />
        <Text c='dimmed'>Waiting for {room.owner?.pseudo ?? 'the owner'} to add a board</Text>
      </Stack>
    </Center>
  )

/** A board of the room: what it is, open it, delete it (owner) */
const BoardCard = ({ board, label, onOpen, onDelete }: { board: Board; label: string; onOpen: () => void; onDelete?: (() => void) | undefined }) => {
  const app = findClientApp(board.type)

  return (
    <Card className={classes.boardCard} shadow='xs'>
      <Group justify='space-between' align='flex-start' wrap='nowrap' gap='xs'>
        {app ? <AppInfo app={app} label={label} size={40} /> : <Text c='dimmed'>Unknown board type: {board.type}</Text>}
        {onDelete && (
          <Tooltip label='Delete this board'>
            <ActionIcon variant='subtle' color='red' aria-label={`Delete ${label}`} onClick={onDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Group justify='flex-end' mt='md'>
        <Button variant='light' color={app?.color} size='xs' rightSection={<IconArrowRight size={14} />} onClick={onOpen}>
          Open
        </Button>
      </Group>
    </Card>
  )
}

/** The main tab of a room: its boards at a glance and who is here */
const RoomOverview = ({ room, user, onOpen, owner }: RoomOverviewProps) => {
  const labels = boardLabels(room.boards)

  return (
    <Stack gap='xl' pb='md'>
      <Stack gap='sm'>
        <Title order={4}>Boards</Title>
        {room.boards.length === 0 ? (
          <NoBoard room={room} owner={owner} />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {room.boards.map((board, index) => (
              <BoardCard
                key={board.id}
                board={board}
                label={labels[index] ?? board.type}
                onOpen={() => onOpen(board.id)}
                onDelete={owner && (() => owner.onDelete(board.id))}
              />
            ))}
            {owner && (
              <UnstyledButton className={classes.addCard} onClick={owner.onAdd} disabled={owner.adding}>
                <IconPlus size={20} />
                <Text fw={500}>Add a board</Text>
              </UnstyledButton>
            )}
          </SimpleGrid>
        )}
      </Stack>

      <Stack gap='sm'>
        <Title order={4}>In the room</Title>
        <Text size='sm' c='dimmed'>
          Created by {owner ? 'you' : (room.owner?.pseudo ?? 'an unknown user')} <RelativeTime timestamp={room.createdAt} />
        </Text>
        {room.watchers.length === 0 ? (
          <Text size='sm' c='dimmed'>
            Nobody is here.
          </Text>
        ) : (
          <Group gap='md'>
            {room.watchers.map(watcher => (
              <Group key={watcher.id} gap={6} wrap='nowrap'>
                <UserAvatar user={{ id: watcher.id, name: watcher.pseudo }} size='sm' />
                <Text size='sm'>{watcher.id === user.id ? `${watcher.pseudo} (you)` : watcher.pseudo}</Text>
                {watcher.id === room.owner?.id && (
                  <Badge size='sm' variant='default'>
                    Owner
                  </Badge>
                )}
              </Group>
            ))}
          </Group>
        )}
      </Stack>
    </Stack>
  )
}

export default RoomOverview
