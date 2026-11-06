import type { AppType } from '@back/apps'
import { clientAppEntries, findClientApp } from '@front/apps'
import { confirmDelete } from '@front/utils/confirmDelete'
import { getPathParams } from '@front/utils/path'
import { trpc } from '@front/utils/trpc'
import { Button, Center, Group, Image, Modal, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { ErrorAlert, Loading } from '@platform/client'
import type { Room, User } from '@platform/model'
import { IconApps, IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-react'
import { Suspense, useState } from 'react'
import classes from './Room.module.css'

const RoomInner = ({ user, room }: { user: User; room: Room }) => {
  const [showNewGame, setShowNewGame] = useState(false)
  const isOwner = user.id === room.owner?.id
  const [activeTabIndex, setActiveTabIndex] = useState(room.boards.length)

  const activeBoard = activeTabIndex > 0 ? room.boards[activeTabIndex - 1] : undefined
  const ActiveApp = activeBoard && findClientApp(activeBoard.type)?.Component
  const addNewBoardMutation = trpc.protected.addBoard.useMutation({
    onSuccess: data => {
      console.log('board created', data)
      if (data) {
        setActiveTabIndex(data.boards.length)
      }
    }
  })

  const deleteBoardMutation = trpc.protected.deleteBoard.useMutation({
    onSuccess: data => {
      console.log('board deleted', data)
    }
  })

  const newBoard = (type: AppType) => {
    setShowNewGame(false)
    addNewBoardMutation.mutate({
      type,
      roomId: room.id
    })
  }

  const deleteBoard = (boardId: string) => {
    confirmDelete('Delete board', 'Delete this board for everyone in the room?', () =>
      deleteBoardMutation.mutate({
        roomId: room.id,
        boardId
      })
    )
  }

  return (
    <Stack flex={1} mih={0} gap='sm'>
      {activeBoard && isOwner && (
        <Group justify='flex-end'>
          <Button color='red' variant='light' leftSection={<IconTrash size={16} />} onClick={() => deleteBoard(activeBoard.id)}>
            Delete board
          </Button>
        </Group>
      )}

      {!activeBoard ? (
        <Center flex={1}>
          {isOwner ? (
            <Button size='md' leftSection={<IconPlus size={18} />} onClick={() => setShowNewGame(true)} loading={addNewBoardMutation.isPending}>
              New board
            </Button>
          ) : (
            <Text c='dimmed'>Waiting for {room.owner?.pseudo ?? ''}</Text>
          )}
        </Center>
      ) : ActiveApp ? (
        <Suspense fallback={<Loading />}>
          <ActiveApp key={activeBoard.id} user={user} room={room} boardId={activeBoard.id} />
        </Suspense>
      ) : (
        <Center flex={1}>
          <Text c='dimmed'>Unknown board type: {activeBoard.type}</Text>
        </Center>
      )}

      <Modal opened={showNewGame} onClose={() => setShowNewGame(false)} title='Create a new board' size='lg'>
        <SimpleGrid cols={{ base: 2, sm: 3 }}>
          {clientAppEntries.map(([type, app]) => (
            <UnstyledButton key={type} className={classes.tile} onClick={() => newBoard(type)}>
              {app.icon ? <Image src={app.icon} alt='' h={48} w='auto' /> : <IconApps size={48} stroke={1.5} />}
              <Text size='sm' fw={500}>
                {app.label}
              </Text>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Modal>
    </Stack>
  )
}

const RoomComponent = () => {
  const [room, setRoom] = useState<Room>()
  const [error, setError] = useState<string | undefined>()

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  const [roomId] = getPathParams()

  trpc.protected.watchRoom.useSubscription(
    { roomId },
    {
      onData(data) {
        console.log('received dataaaa !')
        setRoom(data)
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  return (
    <Stack flex={1} mih={0} gap='sm'>
      <Group gap='sm'>
        <Button component='a' href='#/home' variant='subtle' leftSection={<IconArrowLeft size={16} />}>
          Back to Home
        </Button>
        <Title order={3}>{room?.title}</Title>
      </Group>
      {error ? <ErrorAlert title='Room unavailable'>{error}</ErrorAlert> : room ? <RoomInner user={user!} room={room} /> : <Loading />}
    </Stack>
  )
}

export default RoomComponent
