import '@yorab/react-paint/react-paint.css'
import { type AppProps, ErrorAlert, Loading, PresenceBar, useYDoc, type YBoard } from '@platform/client'
import { Canvas, Editor, type EditorOptions, useReactPaint } from '@yorab/react-paint'
import classes from './Paint.module.css'
import RemotePointers, { usePointerPublisher } from './RemotePointers'
import { trpc } from './trpc'
import { usePaintDoc } from './usePaintDoc'

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

const Drawing = ({ board, unsent, userId }: { board: YBoard; unsent: boolean; userId: string }) => {
  const paint = useReactPaint({
    mode: 'editor',
    width: 1280,
    height: 720
  })
  usePaintDoc(paint, board.doc)
  const pointerHandlers = usePointerPublisher(paint, board.awareness)

  return (
    <div className={classes.screen} {...pointerHandlers}>
      <div className={classes.presence}>
        <PresenceBar awareness={board.awareness} userId={userId} unsent={unsent} />
      </div>
      <Editor paint={paint} options={EDITOR_OPTIONS}>
        <Canvas paint={paint} />
      </Editor>
      <RemotePointers paint={paint} awareness={board.awareness} />
    </div>
  )
}

const Paint = ({ boardId, user }: AppProps) => {
  const { client } = trpc.useUtils()
  const { board, unsent, error } = useYDoc({ client: client.paint, boardId, user })

  if (error) {
    return <ErrorAlert title='Board unavailable'>{error}</ErrorAlert>
  }
  if (!board) {
    return <Loading />
  }
  return <Drawing board={board} unsent={unsent} userId={user.id} />
}

export default Paint
