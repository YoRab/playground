import { confirmDelete } from '@front/utils/confirmDelete'
import { reportError } from '@front/utils/reportError'
import { trpc } from '@front/utils/trpc'
import { Avatar, Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core'
import type { Room } from '@platform/model'
import { IconArrowRight, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

const MAX_AVATARS = 4

const Home = () => {
  const [rooms, setRooms] = useState<Room[]>([])

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  trpc.public.onGetRooms.useSubscription(undefined, {
    onData(games) {
      console.log('received rooms', games)
      setRooms(games)
    },
    onError(err) {
      console.error('Subscription error:', err)
      reportError('Rooms unavailable', err.message)
    }
  })

  const addNewGameMutation = trpc.protected.addNewRoom.useMutation({
    onSuccess: data => {
      console.log('room created', data)
      if (data) window.location.href = `#/room/${data.id}`
    }
  })

  const deleteRoomMutation = trpc.protected.deleteRoom.useMutation({
    onSuccess: data => {
      console.log('room deleted', data)
    }
  })

  const addNewRoom = () => {
    addNewGameMutation.mutate()
  }

  const deleteRoom = (room: Room) => {
    confirmDelete(
      'Delete room',
      <Text size='sm'>
        Delete <strong>{room.title}</strong> and all its boards?
      </Text>,
      () => deleteRoomMutation.mutate({ room: room.id })
    )
  }

  return (
    <Stack gap='lg'>
      <Group justify='space-between'>
        <Title order={2}>Active rooms</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={addNewRoom} loading={addNewGameMutation.isPending}>
          New
        </Button>
      </Group>

      {rooms.length === 0 ? (
        <Text c='dimmed' ta='center' py='xl'>
          No active room yet
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {rooms.map(room => (
            <Card key={room.id} withBorder shadow='sm' padding='lg'>
              <Stack gap='xs' flex={1}>
                <Text fw={600} size='lg'>
                  {room.title}
                </Text>
                <Text size='sm' c='dimmed'>
                  Created on {new Date(room.createdAt).toUTCString()} by {room.owner?.pseudo ?? 'Unknown (çà pue le bug)'}
                </Text>
                <Group gap='sm'>
                  <Badge variant='light'>{room.watchers.length} in the room</Badge>
                  <Avatar.Group spacing='sm'>
                    {room.watchers.slice(0, MAX_AVATARS).map(watcher => (
                      <Tooltip key={watcher.id} label={watcher.pseudo} withArrow>
                        <Avatar name={watcher.pseudo} color='initials' size='sm' />
                      </Tooltip>
                    ))}
                    {room.watchers.length > MAX_AVATARS && <Avatar size='sm'>+{room.watchers.length - MAX_AVATARS}</Avatar>}
                  </Avatar.Group>
                </Group>
              </Stack>

              <Group justify='space-between' mt='md'>
                {room.owner?.id === user?.id ? (
                  <Button color='red' variant='light' leftSection={<IconTrash size={16} />} onClick={() => deleteRoom(room)}>
                    Delete
                  </Button>
                ) : (
                  <span />
                )}
                <Button component='a' href={`#/room/${room.id}`} rightSection={<IconArrowRight size={16} />}>
                  Join
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}

export default Home
