import { Paper } from '@mantine/core'
import { type AppProps, ErrorAlert } from '@platform/client'
import { type FormEvent, useRef, useState } from 'react'
import { trpc } from './trpc'
import classes from './Word.module.css'

const Word = ({ boardId }: AppProps) => {
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | undefined>()

  trpc.word.watch.useSubscription(
    { boardId },
    {
      onData(board) {
        if (!contentEditableRef.current) return
        if (contentEditableRef.current.textContent !== board.data) {
          contentEditableRef.current.textContent = board.data
        }
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  const setWordMutation = trpc.word.set.useMutation()

  const onChangeWord = (e: FormEvent<HTMLElement>) => {
    setWordMutation.mutate({ boardId, value: (e.target as HTMLElement).textContent ?? '' })
  }

  if (error) {
    return <ErrorAlert title='Board unavailable'>{error}</ErrorAlert>
  }
  return (
    <Paper withBorder p='md'>
      <div ref={contentEditableRef} className={classes.content} contentEditable onInput={onChangeWord} />
    </Paper>
  )
}

export default Word
