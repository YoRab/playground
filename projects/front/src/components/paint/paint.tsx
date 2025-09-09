import React, { useEffect, useRef, useState } from 'react'
import './paint.css'
import type { Room, User } from '@common/model'
import { trpc } from '@front/utils/trpc'
import { Canvas, Editor, type StateData, useReactPaint, type DrawableShape } from '@yorab/react-paint'

const Paint = ({ user, room, boardId }: { user: User; room: Room; boardId: string }) => {
  const tempShapes = useRef<string | undefined>('[]')
  const [error, setError] = useState<string | undefined>()

  const { registerEvent, unregisterEvent, resetCanvas, editorProps, canvasProps } = useReactPaint({
    mode: 'editor',
    width: 1280,
    height: 720
  })

  trpc.paint.watchPaint.useSubscription(
    { boardId },
    {
      onData(paint) {
        console.log('received dataaaa !')
        if (JSON.stringify(paint.data) === tempShapes.current) {
          return
        }
        console.log('reset')
        resetCanvas(paint.data as DrawableShape[])
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
    registerEvent('dataChanged', onDataChanged)
    return () => {
      unregisterEvent('dataChanged', onDataChanged)
    }
  }, [registerEvent, unregisterEvent, setPaintMutate, boardId])

  return (
    <div className='ScreenPaint'>
      {error ?? (
        <Editor editorProps={editorProps}>
          <Canvas canvasProps={canvasProps} />
        </Editor>
      )}
    </div>
  )
}

export default Paint
