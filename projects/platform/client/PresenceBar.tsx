import { Badge, Group, Text } from '@mantine/core'
import type { Awareness } from 'y-protocols/awareness'
import { z } from 'zod'
import { usePeers } from './peers'

// only the user is needed here
const baseSchema = z.object({})

/**
 * Who is on the board, one badge per user (several tabs count once), and a notice while local changes are not sent.
 * It reads the awareness itself: a component that shows the whole board does not re-render each time a pointer moves.
 */
const PresenceBar = ({ awareness, userId, unsent }: { awareness: Awareness; userId: string; unsent: boolean }) => {
  const peers = usePeers(awareness, baseSchema)
  const users = [...new Map(peers.map(peer => [peer.user.id, peer])).values()]
  return (
    <Group justify='space-between'>
      <Group gap='xs'>
        {users.map(({ user, color }) => (
          <Badge key={user.id} color={color} variant={user.id === userId ? 'filled' : 'light'}>
            {user.id === userId ? `${user.name} (you)` : user.name}
          </Badge>
        ))}
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
