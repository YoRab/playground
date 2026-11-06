import { useEffect, useRef, useState } from 'react'
import '@yorab/react-paint/react-paint.css'
import { type AppProps, ErrorAlert } from '@platform/client'
import { Canvas, type DrawableShape, Editor, type EditorOptions, type StateData, useReactPaint } from '@yorab/react-paint'
import classes from './Paint.module.css'
import { trpc } from './trpc'

// the editor injects its colors as CSS variables: Mantine variables follow the color scheme without JS
const EDITOR_OPTIONS: EditorOptions = {
  toolbarBackgroundColor: 'var(--mantine-color-body)',
  dividerColor: 'var(--mantine-color-default-border)',
  fontColor: 'var(--mantine-color-text)',
  fontHoverColor: 'var(--mantine-color-text)',
  fontHoverBackgroundColor: 'var(--mantine-color-default-hover)',
  fontSelectedColor: 'var(--mantine-color-white)',
  fontSelectedBackgroundColor: 'var(--mantine-primary-color-filled)',
  fontDisabledColor: 'var(--mantine-color-dimmed)'
}

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
    <div className={classes.screen}>
      {error ? (
        <ErrorAlert title='Board unavailable'>{error}</ErrorAlert>
      ) : (
        <Editor paint={paint} options={EDITOR_OPTIONS}>
          <Canvas paint={paint} />
        </Editor>
      )}
    </div>
  )
}

export default Paint
