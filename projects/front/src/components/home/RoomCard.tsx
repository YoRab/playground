import { findClientApp } from '@front/apps'
import AppIcon from '@front/components/AppIcon'
import RelativeTime from '@front/components/RelativeTime'
import { countByType } from '@front/utils/countByType'
import { ActionIcon, Badge, Card, Group, Text, Tooltip } from '@mantine/core'
import { UserAvatar, UserAvatars } from '@platform/client'
import type { Room, User } from '@platform/model'
import { IconArrowRight, IconTrash } from '@tabler/icons-react'
import classes from './Home.module.css'

type RoomCardProps = {
  room: Room
  user: User | null | undefined
  onDelete: (room: Room) => void
}

/** The boards of a room, one badge per app type ("Word ×2") */
const BoardBadges = ({ room }: { room: Room }) => {
  if (room.boards.length === 0) {
    return (
      <Text size='sm' c='dimmed'>
        No board yet
      </Text>
    )
  }
  return [...countByType(room.boards)].map(([type, count]) => {
    const app = findClientApp(type)
    return (
      <Badge key={type} size='lg' color={app?.color ?? 'gray'} tt='none' fw={500} leftSection={<AppIcon type={type} size={14} />}>
        {app?.label ?? type}
        {count > 1 ? ` ×${count}` : ''}
      </Badge>
    )
  })
}

/**
 * A room of the home page. The whole card is a link (the title's ::after covers it, which avoids nesting the delete
 * button inside a link); the delete button and the avatars sit above it.
 */
const RoomCard = ({ room, user, onDelete }: RoomCardProps) => {
  const isOwner = !!user && room.owner?.id === user.id
  const online = room.watchers.length

  return (
    <Card className={classes.card} shadow='xs'>
      <Group justify='space-between' align='flex-start' wrap='nowrap' gap='xs'>
        <a href={`#/room/${room.id}`} className={classes.link}>
          <Text fw={600} size='lg' lineClamp={1}>
            {room.title}
          </Text>
        </a>
        {isOwner && (
          <Tooltip label='Delete this room'>
            <ActionIcon className={classes.above} variant='subtle' color='red' aria-label='Delete this room' onClick={() => onDelete(room)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Group gap={6} mt={4} wrap='nowrap'>
        <UserAvatar user={room.owner && { id: room.owner.id, name: room.owner.pseudo }} size={20} />
        <Text size='sm' c='dimmed' truncate>
          {isOwner ? 'You' : (room.owner?.pseudo ?? 'Unknown')} · <RelativeTime timestamp={room.createdAt} />
        </Text>
      </Group>

      <Group gap={6} mt='md' mih={26}>
        <BoardBadges room={room} />
      </Group>

      <Group justify='space-between' mt='md' pt='sm' className={classes.footer}>
        {online === 0 ? (
          <Text size='sm' c='dimmed'>
            Nobody here
          </Text>
        ) : (
          <Group gap='xs'>
            <div className={classes.above}>
              <UserAvatars users={room.watchers.map(watcher => ({ id: watcher.id, name: watcher.pseudo }))} meId={user?.id} />
            </div>
            <Group gap={6}>
              <span className={classes.onlineDot} />
              <Text size='sm' c='dimmed'>
                {online} online
              </Text>
            </Group>
          </Group>
        )}
        <Group gap={4} className={classes.join}>
          <Text size='sm' fw={600} c='inherit'>
            Join
          </Text>
          <IconArrowRight size={16} />
        </Group>
      </Group>
    </Card>
  )
}

export default RoomCard
