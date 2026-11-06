import { useEffect, useRef, useState } from 'react'
import './paint.css'
import { trpc } from '@front/utils/trpc'
import { Canvas, type DrawableShape, Editor, type StateData, useReactPaint } from '@yorab/react-paint'

const Paint = ({ boardId }: { boardId: string }) => {
  const tempShapes = useRef<string | undefined>('[]')
  const [error, setError] = useState<string | undefined>()

  const paint = useReactPaint({
    mode: 'editor',
    width: 1280,
    height: 720
  })

  trpc.paint.watchPaint.useSubscription(
    { boardId },
    {
      onData(received) {
        console.log('received dataaaa !')
        if (JSON.stringify(received.data) === tempShapes.current) {
          return
        }
        console.log('reset')
        paint.resetCanvas(received.data as DrawableShape[])
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  const { mutate: setPaintMutate } = trpc.paint.setPaint.useMutation()

  useEffect(() => {
    const onDataChanged = (data: StateData, source: 'user' | 'remote') => {
      if (source !== 'user') return
      const newData = JSON.stringify(data.shapes)
      if (tempShapes.current === newData) return
      tempShapes.current = newData
      setPaintMutate({ boardId, value: data.shapes })
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
