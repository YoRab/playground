import { Group, Text } from '@mantine/core'
import type { Awareness } from 'y-protocols/awareness'
import { z } from 'zod'
import { usePeers } from './peers'
import UserAvatars from './UserAvatars'

// only the user is needed here
const baseSchema = z.object({})

/**
 * Who is on the board, one avatar per user (several tabs count once) in their color, and a notice while local changes are not sent.
 * It reads the awareness itself: a component that shows the whole board does not re-render each time a pointer moves.
 */
const PresenceBar = ({ awareness, userId, unsent }: { awareness: Awareness; userId: string; unsent: boolean }) => {
  const peers = usePeers(awareness, baseSchema)
  const users = [...new Map(peers.map(peer => [peer.user.id, peer.user])).values()]
  const others = users.filter(user => user.id !== userId).length

  return (
    <Group justify='space-between' gap='xs'>
      <Group gap='xs'>
        <UserAvatars users={users} meId={userId} max={6} />
        <Text size='xs' c='dimmed'>
          {others === 0 ? 'Only you on this board' : `${others} other${others > 1 ? 's' : ''} on this board`}
        </Text>
      </Group>
      {unsent && (
        <Text size='xs' c='orange'>
          Offline: your changes will be sent when the connection is back
        </Text>
      )}
    </Group>
  )
}

export default PresenceBar
