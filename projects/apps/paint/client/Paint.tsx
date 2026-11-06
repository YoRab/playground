import { useEffect, useRef, useState } from 'react'
import '@yorab/react-paint/react-paint.css'
import './paint.css'
import type { AppProps } from '@platform/client'
import { Canvas, type DrawableShape, Editor, type StateData, useReactPaint } from '@yorab/react-paint'
import { trpc } from './trpc'

const Paint = ({ boardId }: AppProps) => {
  const tempShapes = useRef<string | undefined>('[]')
  const [error, setError] = useState<string | undefined>()

  const paint = useReactPaint({
    mode: 'editor',
    width: 1280,
    height: 720
  })

  trpc.paint.watch.useSubscription(
    { boardId },
    {
      onData(board) {
        if (JSON.stringify(board.data) === tempShapes.current) {
          return
        }
        paint.resetCanvas(board.data as DrawableShape[])
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  const { mutate: setPaintMutate } = trpc.paint.set.useMutation()

  useEffect(() => {
    const onDataChanged = (data: StateData, source: 'user' | 'remote') => {
      if (source !== 'user') return
      const shapes = data.shapes ?? []
      const newData = JSON.stringify(shapes)
      if (tempShapes.current === newData) return
      tempShapes.current = newData
      setPaintMutate({ boardId, value: shapes })
    }
    return paint.registerEvent('dataChanged', onDataChanged)
  }, [paint, setPaintMutate, boardId])

  return (
    <div className='ScreenPaint'>
      {error ?? (
        <Editor paint={paint}>
          <Canvas paint={paint} />
        </Editor>
      )}
    </div>
  )
}

export default Paint
