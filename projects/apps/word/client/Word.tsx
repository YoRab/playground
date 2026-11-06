import { type FormEvent, useRef, useState } from 'react'
import './word.css'
import type { AppProps } from '@platform/client'
import { trpc } from './trpc'

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
  return <div className='ScreenWord'>{error ?? <div ref={contentEditableRef} className='WordContent' contentEditable onInput={onChangeWord} />}</div>
}

export default Word
