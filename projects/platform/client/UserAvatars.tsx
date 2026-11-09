import { Avatar, type MantineColor, type MantineSize, Tooltip } from '@mantine/core'
import { useTranslation } from './i18n'
import { userColor } from './userColor'

type AvatarUser = {
  id: string
  name: string
  /** Mantine color; by default the color of the user (`userColor`), the one of its carets and pointers */
  color?: MantineColor | undefined
}

/** One user's avatar, in their color; a gray placeholder when there is no user (yet) */
export const UserAvatar = ({ user, size = 'sm' }: { user: AvatarUser | null | undefined; size?: MantineSize | number }) => (
  <Avatar name={user?.name} color={user ? (user.color ?? userColor(user.id)) : 'gray'} size={size} />
)

type UserAvatarsProps = {
  users: AvatarUser[]
  /** Avatars shown before the "+N" one */
  max?: number
  size?: MantineSize
  /** The local user: "(you)" in its tooltip and a ring around its avatar */
  meId?: string | undefined
}

/** Overlapping avatars of a list of users, each with its name in a tooltip */
const UserAvatars = ({ users, max = 4, size = 'sm', meId }: UserAvatarsProps) => {
  const { t } = useTranslation('platform')
  const shown = users.length > max ? users.slice(0, max - 1) : users
  const hidden = users.slice(shown.length)

  return (
    <Avatar.Group spacing='sm'>
      {shown.map(user => (
        <Tooltip key={user.id} label={user.id === meId ? t('you', { name: user.name }) : user.name}>
          <Avatar
            name={user.name}
            color={user.color ?? userColor(user.id)}
            size={size}
            style={user.id === meId ? { outline: '2px solid var(--mantine-primary-color-filled)', outlineOffset: 1 } : undefined}
          />
        </Tooltip>
      ))}
      {hidden.length > 0 && (
        <Tooltip label={hidden.map(user => user.name).join(', ')}>
          <Avatar size={size}>+{hidden.length}</Avatar>
        </Tooltip>
      )}
    </Avatar.Group>
  )
}

export default UserAvatars
