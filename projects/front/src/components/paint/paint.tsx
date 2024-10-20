import React, { useCallback, useRef, useState } from 'react'
import './paint.css'
import type { Room, User } from '@common/model'
import { trpc } from '@front/utils/trpc'
import ReactPaint from '@yorab/react-paint'

type AnnotationsType = ReturnType<NonNullable<NonNullable<Parameters<typeof ReactPaint>[0]['apiRef']>['current']>['getCurrentData']>['shapes']

const Paint = ({ user, room, boardId }: { user: User; room: Room; boardId: string }) => {
  const apiRef: Parameters<typeof ReactPaint>[0]['apiRef'] = useRef()
  const [shapes, setShapes] = useState<AnnotationsType>(undefined)
  const tempShapes = useRef<string | undefined>('[]')
  const [error, setError] = useState<string | undefined>()

  trpc.paint.watchPaint.useSubscription(
    { boardId },
    {
      onData(paint) {
        console.log('received dataaaa !')
        if (JSON.stringify(paint.data) === tempShapes.current) {
          return
        }
        setShapes(paint.data as AnnotationsType)
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  const setPaintMutation = trpc.paint.setPaint.useMutation()

  const saveAnnotation = useCallback(() => {
    if (!apiRef.current) return
    const drawData = apiRef.current.getCurrentData()
    const newData = JSON.stringify(drawData.shapes)
    if (tempShapes.current === newData) return
    tempShapes.current = newData
    setPaintMutation.mutate({ boardId, value: drawData.shapes })
  }, [setPaintMutation, boardId])

  return (
    <div className='ScreenPaint'>
      {error ?? <ReactPaint width={1280} height={720} shapes={shapes} onDataChanged={saveAnnotation} apiRef={apiRef} />}
    </div>
  )
}

export default Paint
