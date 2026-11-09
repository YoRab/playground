import { Paper, Stack } from '@mantine/core'
import { type AppProps, ErrorAlert, Loading, PresenceBar, useTranslation, useYDoc, type YBoard } from '@platform/client'
import RemoteCursors from './RemoteCursors'
import { trpc } from './trpc'
import { useYTextarea } from './useYTextarea'
import classes from './Word.module.css'

const Editor = ({ board, unsent, userId }: { board: YBoard; unsent: boolean; userId: string }) => {
  const { t } = useTranslation('word')
  const { text, textareaProps } = useYTextarea(board)

  return (
    // a centered sheet: lines stay readable on a wide screen
    <Stack gap='sm' w='100%' maw={860} mx='auto'>
      <PresenceBar awareness={board.awareness} userId={userId} unsent={unsent} />
      <Paper withBorder shadow='xs' p={{ base: 'md', sm: 'xl' }}>
        <div className={classes.editor}>
          <textarea {...textareaProps} className={`${classes.surface} ${classes.input}`} aria-label={t('editor')} spellCheck />
          <RemoteCursors doc={board.doc} awareness={board.awareness} text={text} />
        </div>
      </Paper>
    </Stack>
  )
}

const Word = ({ boardId, user }: AppProps) => {
  const { client } = trpc.useUtils()
  const { board, unsent, error } = useYDoc({ client: client.word, boardId, user })

  if (error) {
    return <ErrorAlert error={error} />
  }
  if (!board) {
    return <Loading />
  }
  return <Editor board={board} unsent={unsent} userId={user.id} />
}

export default Word
