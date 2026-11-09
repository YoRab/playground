import { ActionIcon, Group, Text, Title, Tooltip } from '@mantine/core'
import { UserAvatars, useTranslation } from '@platform/client'
import type { Room, User } from '@platform/model'
import { IconArrowLeft, IconSettings } from '@tabler/icons-react'
import { useState } from 'react'
import InviteButton from './InviteButton'
import RoomSettingsModal from './RoomSettingsModal'
import VisibilityBadge from './VisibilityBadge'

/** Back to the rooms, the title and visibility, the settings (owner), who is in the room and the invitation link */
const RoomHeader = ({ room, user }: { room: Room; user: User }) => {
  const { t } = useTranslation('host')
  const [settingsOpened, setSettingsOpened] = useState(false)
  const isOwner = user.id === room.owner?.id
  // a private room is the owner's alone: no limit nor invitation
  const shared = room.visibility !== 'private'

  return (
    <Group justify='space-between' wrap='nowrap' gap='sm'>
      <Group gap='xs' wrap='nowrap' miw={0} flex={1}>
        <Tooltip label={t('room.allRooms')}>
          <ActionIcon component='a' href='#/home' variant='subtle' color='gray' size='lg' aria-label={t('room.allRooms')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
        </Tooltip>
        <Title order={3} lineClamp={1}>
          {room.title}
        </Title>
        <VisibilityBadge visibility={room.visibility} size='md' iconSize={14} />
        {isOwner && (
          <>
            <Tooltip label={t('room.settings')}>
              <ActionIcon variant='subtle' color='gray' aria-label={t('room.settings')} onClick={() => setSettingsOpened(true)}>
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>
            <RoomSettingsModal room={room} opened={settingsOpened} onClose={() => setSettingsOpened(false)} />
          </>
        )}
      </Group>
      <Group gap='md' wrap='nowrap'>
        <Group gap='xs' wrap='nowrap' visibleFrom='xs'>
          <UserAvatars users={room.watchers.map(watcher => ({ id: watcher.id, name: watcher.pseudo }))} meId={user.id} />
          {shared && (
            <Tooltip label={t('room.participants')}>
              <Text size='sm' c='dimmed'>
                {room.watchers.length}/{room.maxParticipants}
              </Text>
            </Tooltip>
          )}
        </Group>
        {shared && <InviteButton roomId={room.id} visibility={room.visibility} />}
      </Group>
    </Group>
  )
}

export default RoomHeader
