import type { AppType } from '@back/apps'
import { findClientApp } from '@front/apps'
import { confirmDelete } from '@front/utils/confirmDelete'
import { getPathParams } from '@front/utils/path'
import { trpc } from '@front/utils/trpc'
import { Button, Center, Modal, Stack, Text } from '@mantine/core'
import { ErrorAlert, Loading } from '@platform/client'
import type { Room, RoomView, User } from '@platform/model'
import { IconArrowLeft } from '@tabler/icons-react'
import { Suspense, useEffect, useState } from 'react'
import AppPicker from './AppPicker'
import BoardTabs, { type OwnerActions } from './BoardTabs'
import RoomHeader from './RoomHeader'
import RoomLocked from './RoomLocked'
import RoomOverview from './RoomOverview'

const RoomInner = ({ user, room }: { user: User; room: Room }) => {
  const isOwner = user.id === room.owner?.id
  const [showPicker, setShowPicker] = useState(false)
  // the board asked by the URL (#/room/<roomId>/<boardId>); the overview when there is none, or when it is missing or deleted
  const [selectedId, setSelectedId] = useState<string | undefined>(() => getPathParams()[1])
  const activeBoard = room.boards.find(board => board.id === selectedId)
  const activeBoardId = activeBoard?.id
  const ActiveApp = activeBoard && findClientApp(activeBoard.type)?.Component

  // the URL follows the active board: a reload or a shared link opens it. replaceState: no history entry per tab, and the router does not react
  useEffect(() => {
    const hash = activeBoardId ? `#/room/${room.id}/${activeBoardId}` : `#/room/${room.id}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
  }, [room.id, activeBoardId])

  const addBoardMutation = trpc.protected.addBoard.useMutation({
    onSuccess: data => {
      const newBoard = data ? data.boards.at(-1) : undefined
      if (newBoard) setSelectedId(newBoard.id)
    }
  })

  const deleteBoardMutation = trpc.protected.deleteBoard.useMutation()
  const kickMutation = trpc.protected.kickUser.useMutation()

  const addBoard = (type: AppType) => {
    setShowPicker(false)
    addBoardMutation.mutate({ type, roomId: room.id })
  }

  const deleteBoard = (boardId: string) => {
    confirmDelete('Delete board', 'Delete this board for everyone in the room?', () => deleteBoardMutation.mutate({ roomId: room.id, boardId }))
  }

  const kick = (target: User) => {
    confirmDelete(
      'Kick out',
      <Text size='sm'>
        Kick <strong>{target.pseudo}</strong> out of the room? They won't be able to come back until you let them in from the room settings.
      </Text>,
      () => kickMutation.mutate({ roomId: room.id, userId: target.id }),
      'Kick out'
    )
  }

  const owner: OwnerActions | undefined = isOwner
    ? { onAdd: () => setShowPicker(true), onPick: addBoard, onDelete: deleteBoard, adding: addBoardMutation.isPending }
    : undefined

  return (
    <Stack flex={1} mih={0} gap='md'>
      <RoomHeader room={room} user={user} />

      <BoardTabs boards={room.boards} active={activeBoardId} onSelect={setSelectedId} owner={owner} />

      {!activeBoard ? (
        <RoomOverview room={room} user={user} onOpen={setSelectedId} owner={owner} onKick={isOwner ? kick : undefined} />
      ) : ActiveApp ? (
        <Suspense fallback={<Loading />}>
          <ActiveApp key={activeBoard.id} user={user} room={room} boardId={activeBoard.id} />
        </Suspense>
      ) : (
        <Center flex={1}>
          <Text c='dimmed'>Unknown board type: {activeBoard.type}</Text>
        </Center>
      )}

      <Modal opened={showPicker} onClose={() => setShowPicker(false)} title='Add a board' size='lg'>
        <AppPicker onPick={addBoard} />
      </Modal>
    </Stack>
  )
}

const RoomComponent = () => {
  // the room once in it, or why the user is kept out: it changes live (password accepted, spot freed, kicked out…)
  const [view, setView] = useState<RoomView>()
  const [error, setError] = useState<string | undefined>()

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  const [roomId] = getPathParams()

  trpc.protected.watchRoom.useSubscription(
    { roomId },
    {
      onData(data) {
        setView(data)
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  if (error) {
    return (
      <Stack gap='md'>
        <Button component='a' href='#/home' variant='subtle' leftSection={<IconArrowLeft size={16} />} w='fit-content'>
          All rooms
        </Button>
        <ErrorAlert title='Room unavailable'>{error}</ErrorAlert>
      </Stack>
    )
  }
  if (!view || !user) return <Loading />
  // locked: the room and its boards are unmounted (a kicked out user leaves them right away)
  return view.status === 'joined' ? <RoomInner user={user} room={view.room} /> : <RoomLocked room={view.room} reason={view.reason} />
}

export default RoomComponent
