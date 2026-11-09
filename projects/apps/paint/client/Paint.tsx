import '@yorab/react-paint/react-paint.css'
import { type AppProps, ErrorAlert, type Language, Loading, PresenceBar, useLanguage, useYDoc, type YBoard } from '@platform/client'
import { Canvas, DEFAULT_EDITOR_LOCALE, Editor, type EditorLocale, type EditorOptions, useReactPaint } from '@yorab/react-paint'
import { useMemo } from 'react'
import { EDITOR_LOCALE_FR } from './locales/editor.fr'
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

/** The texts of the editor and of its canvas in each language of the interface: react-paint ships English only */
const EDITOR_LOCALES: Record<Language, EditorLocale> = { en: DEFAULT_EDITOR_LOCALE, fr: EDITOR_LOCALE_FR }

const Drawing = ({ board, unsent, userId }: { board: YBoard; unsent: boolean; userId: string }) => {
  const paint = useReactPaint({
    mode: 'editor',
    width: 1280,
    height: 720,
    options: {
      size: 'infinite',
      resize: 'extend',
      canZoom: 'always'
    }
  })
  usePaintDoc(paint, board.doc)
  const language = useLanguage()
  const options = useMemo(() => ({ ...EDITOR_OPTIONS, locale: EDITOR_LOCALES[language] }), [language])
  const pointerHandlers = usePointerPublisher(paint, board.awareness)

  return (
    <div className={classes.screen} {...pointerHandlers}>
      <div className={classes.presence}>
        <PresenceBar awareness={board.awareness} userId={userId} unsent={unsent} />
      </div>
      <div className={classes.editorContainer}>
        <div className={classes.editorContent}>
          <Editor paint={paint} options={options}>
            <Canvas paint={paint} />
          </Editor>
        </div>
      </div>
      <RemotePointers paint={paint} awareness={board.awareness} />
    </div>
  )
}

const Paint = ({ boardId, user }: AppProps) => {
  const { client } = trpc.useUtils()
  const { board, unsent, error } = useYDoc({ client: client.paint, boardId, user })

  if (error) {
    return <ErrorAlert error={error} />
  }
  if (!board) {
    return <Loading />
  }
  return <Drawing board={board} unsent={unsent} userId={user.id} />
}

export default Paint
