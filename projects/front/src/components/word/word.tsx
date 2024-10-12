import React, { type FormEvent, useRef, useState } from 'react'
import './word.css'
import type { Session, User } from '@common/model'
import { trpc } from '@front/utils/trpc'

const Word = ({ user, session, boardId }: { user: User; session: Session; boardId: string }) => {
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | undefined>()

  trpc.word.watchWord.useSubscription(
    { wordId: boardId },
    {
      onData(data) {
        console.log('received dataaaa !')
        // setWord(data)
        console.log(contentEditableRef.current?.textContent)
        if (!contentEditableRef.current) return
        if (contentEditableRef.current.textContent !== data.word) {
          contentEditableRef.current.textContent = data.word
        }
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  const setWordMutation = trpc.word.setWord.useMutation()

  const onChangeWord = (e: FormEvent<HTMLElement>) => {
    setWordMutation.mutate({ wordId: boardId, value: (e.target as HTMLElement).textContent ?? '' })
  }
  return <div className='ScreenWord'>{error ?? <div ref={contentEditableRef} className='WordContent' contentEditable onInput={onChangeWord} />}</div>
}

export default Word
