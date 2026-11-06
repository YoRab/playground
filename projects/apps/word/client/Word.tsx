import { Badge, Group, Paper, Stack, Text } from '@mantine/core'
import { type AppProps, ErrorAlert, Loading } from '@platform/client'
import { type Peer, usePeers } from './peers'
import RemoteCursors from './RemoteCursors'
import { type BoardDoc, useBoardDoc } from './useBoardDoc'
import { useYTextarea } from './useYTextarea'
import classes from './Word.module.css'

/** One badge per participant (a user with several tabs counts once) */
const Participants = ({ peers, userId }: { peers: Peer[]; userId: string }) => {
  const participants = [...new Map(peers.map(peer => [peer.user.id, peer])).values()]
  return (
    <Group gap='xs'>
      {participants.map(({ user, color }) => (
        <Badge key={user.id} color={color} variant={user.id === userId ? 'filled' : 'light'}>
          {user.id === userId ? `${user.name} (you)` : user.name}
        </Badge>
      ))}
    </Group>
  )
}

const Editor = ({ board, unsent, userId }: { board: BoardDoc; unsent: boolean; userId: string }) => {
  const { text, textareaProps } = useYTextarea(board)
  const peers = usePeers(board.awareness)

  return (
    <Stack gap='sm'>
      <Group justify='space-between'>
        <Participants peers={peers} userId={userId} />
        {unsent && (
          <Text size='xs' c='orange'>
            Offline: your changes will be sent when the connection is back
          </Text>
        )}
      </Group>
      <Paper withBorder p='md'>
        <div className={classes.editor}>
          <textarea {...textareaProps} className={`${classes.surface} ${classes.input}`} aria-label='Text of the board' spellCheck />
          <RemoteCursors doc={board.doc} text={text} peers={peers} />
        </div>
      </Paper>
    </Stack>
  )
}

const Word = ({ boardId, user }: AppProps) => {
  const { board, synced, unsent, error } = useBoardDoc(boardId, user)

  if (error) {
    return <ErrorAlert title='Board unavailable'>{error}</ErrorAlert>
  }
  if (!board || !synced) {
    return <Loading />
  }
  return <Editor board={board} unsent={unsent} userId={user.id} />
}

export default Word
