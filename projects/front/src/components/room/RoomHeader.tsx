import { trpc } from '@front/utils/trpc'
import { ActionIcon, Box, Group, TextInput, Title, Tooltip } from '@mantine/core'
import { UserAvatars } from '@platform/client'
import type { Room, User } from '@platform/model'
import { IconArrowLeft, IconPencil } from '@tabler/icons-react'
import { useState } from 'react'
import InviteButton from './InviteButton'

/** Edits the title in place: Enter saves, Escape or leaving the field cancels */
const TitleInput = ({ room, onDone }: { room: Room; onDone: () => void }) => {
  const rename = trpc.protected.renameRoom.useMutation()

  const save = (value: string) => {
    const title = value.trim()
    if (title && title !== room.title) rename.mutate({ roomId: room.id, title })
    onDone()
  }

  return (
    <TextInput
      defaultValue={room.title}
      maxLength={60}
      autoFocus
      aria-label='Name of the room'
      w={{ base: '100%', sm: 320 }}
      onFocus={event => event.currentTarget.select()}
      onBlur={onDone}
      onKeyDown={event => {
        if (event.key === 'Enter') save(event.currentTarget.value)
        if (event.key === 'Escape') onDone()
      }}
    />
  )
}

/** Back to the rooms, the title (renamed by the owner), who is in the room and the invitation link */
const RoomHeader = ({ room, user }: { room: Room; user: User }) => {
  const [editing, setEditing] = useState(false)
  const isOwner = user.id === room.owner?.id

  return (
    <Group justify='space-between' wrap='nowrap' gap='sm'>
      <Group gap='xs' wrap='nowrap' miw={0} flex={1}>
        <Tooltip label='All rooms'>
          <ActionIcon component='a' href='#/home' variant='subtle' color='gray' size='lg' aria-label='All rooms'>
            <IconArrowLeft size={20} />
          </ActionIcon>
        </Tooltip>
        {editing ? (
          <TitleInput room={room} onDone={() => setEditing(false)} />
        ) : (
          <>
            <Title order={3} lineClamp={1}>
              {room.title}
            </Title>
            {isOwner && (
              <Tooltip label='Rename the room'>
                <ActionIcon variant='subtle' color='gray' aria-label='Rename the room' onClick={() => setEditing(true)}>
                  <IconPencil size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </>
        )}
      </Group>
      <Group gap='md' wrap='nowrap'>
        <Box visibleFrom='xs'>
          <UserAvatars users={room.watchers.map(watcher => ({ id: watcher.id, name: watcher.pseudo }))} meId={user.id} />
        </Box>
        <InviteButton roomId={room.id} />
      </Group>
    </Group>
  )
}

export default RoomHeader
