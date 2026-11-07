import { confirmDelete } from '@front/utils/confirmDelete'
import { reportError } from '@front/utils/reportError'
import { trpc } from '@front/utils/trpc'
import { Button, Container, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Loading } from '@platform/client'
import type { Room } from '@platform/model'
import { IconDoorEnter, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import classes from './Home.module.css'
import RoomCard from './RoomCard'

const Home = () => {
  // null until the first list arrives: no "No room yet" flash
  const [rooms, setRooms] = useState<Room[] | null>(null)

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  trpc.public.onGetRooms.useSubscription(undefined, {
    onData(rooms) {
      // newest first
      setRooms([...rooms].sort((a, b) => b.createdAt - a.createdAt))
    },
    onError(err) {
      console.error('Subscription error:', err)
      reportError('Rooms unavailable', err.message)
    }
  })

  const addNewRoomMutation = trpc.protected.addNewRoom.useMutation({
    onSuccess: data => {
      if (data) window.location.href = `#/room/${data.id}`
    }
  })

  const deleteRoomMutation = trpc.protected.deleteRoom.useMutation()

  const deleteRoom = (room: Room) => {
    confirmDelete(
      'Delete room',
      <Text size='sm'>
        Delete <strong>{room.title}</strong> and all its boards?
      </Text>,
      () => deleteRoomMutation.mutate({ room: room.id })
    )
  }

  const newRoomButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => addNewRoomMutation.mutate()} loading={addNewRoomMutation.isPending}>
      New room
    </Button>
  )

  return (
    <Container size='lg' w='100%' p={0}>
      <Stack gap='lg'>
        <Group justify='space-between' align='flex-end'>
          <div>
            <Title order={2}>Rooms</Title>
            <Text c='dimmed' size='sm'>
              Join a room, or open your own and invite your friends.
            </Text>
          </div>
          {rooms?.length ? newRoomButton : null}
        </Group>

        {rooms === null ? (
          <Loading />
        ) : rooms.length === 0 ? (
          <Stack align='center' gap='xs' py={64} px='md' className={classes.empty}>
            <ThemeIcon size={56} radius='xl' variant='light'>
              <IconDoorEnter size={28} stroke={1.5} />
            </ThemeIcon>
            <Title order={4} mt='xs'>
              No room yet
            </Title>
            <Text c='dimmed' size='sm' ta='center'>
              Open one and share its link with your friends.
            </Text>
            <Group mt='sm'>{newRoomButton}</Group>
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} user={user} onDelete={deleteRoom} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  )
}

export default Home
