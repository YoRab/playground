import { type AppProps, Loading } from '@platform/client'
import { useState } from 'react'
import { trpc } from './trpc'

const Counter = ({ boardId }: AppProps) => {
  const [value, setValue] = useState<number>()
  const [error, setError] = useState<string>()

  trpc.counter.watch.useSubscription(
    { boardId },
    {
      onData: board => setValue(board.data),
      onError: err => setError(err.message)
    }
  )
  const { mutate } = trpc.counter.set.useMutation()

  if (error) return <div className='CenteredBoard'>{error}</div>
  if (value === undefined) return <Loading />

  return (
    <div className='CenteredBoard'>
      <div className='buttons has-addons'>
        <button type='button' className='button is-large' onClick={() => mutate({ boardId, value: value - 1 })}>
          −
        </button>
        <span className='button is-large is-static'>{value}</span>
        <button type='button' className='button is-large' onClick={() => mutate({ boardId, value: value + 1 })}>
          +
        </button>
      </div>
    </div>
  )
}

export default Counter
