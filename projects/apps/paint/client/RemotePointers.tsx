import { peerColorVar, usePeers, type YBoard } from '@platform/client'
import { type Point, type ReactPaint, usePaintState } from '@yorab/react-paint'
import { type CSSProperties, type PointerEvent, useEffect, useReducer, useRef } from 'react'
import { z } from 'zod'
import classes from './Paint.module.css'

/** What Paint adds to the awareness state: the position of the pointer in the drawing, null outside of it */
export const pointerStateSchema = z.object({ pointer: z.tuple([z.number(), z.number()]).nullable().catch(null) })

// each move is broadcast to everyone: one position every 50 ms looks smooth enough
const PUBLISH_DELAY_MS = 50

const isInside = ([x, y]: Point, area: { x: number; y: number; width: number; height: number }) =>
  x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height

/** Handlers of the element around the canvas, which publish the position of the local pointer in the awareness */
export const usePointerPublisher = (paint: ReactPaint, awareness: YBoard['awareness']) => {
  const pending = useRef<{ x: number; y: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const publish = () => {
    timer.current = undefined
    const position = pending.current
    const point = position && paint.toCanvasPosition(position)
    const next = point && isInside(point, paint.getState().view.visibleArea) ? point : null
    const previous = awareness.getLocalState()?.pointer
    if (JSON.stringify(next) === JSON.stringify(previous ?? null)) return
    awareness.setLocalStateField('pointer', next)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return {
    onPointerMove: (event: PointerEvent) => {
      pending.current = { x: event.clientX, y: event.clientY }
      timer.current ??= setTimeout(publish, PUBLISH_DELAY_MS)
    },
    onPointerLeave: () => {
      clearTimeout(timer.current)
      pending.current = null
      publish()
    }
  }
}

/**
 * The pointers of the other participants over the drawing, with their name. They are placed in the viewport (`position: fixed`)
 * from their position in the drawing: they follow the zoom and the moves of the view.
 */
const RemotePointers = ({ paint, awareness }: { paint: ReactPaint; awareness: YBoard['awareness'] }) => {
  // read here and not in the parent: a pointer that moves re-renders only the pointers
  const peers = usePeers(awareness, pointerStateSchema)
  // the positions on the screen change with the view of the drawing, and with the scroll of the page
  const visibleArea = usePaintState(paint, state => state.view.visibleArea)
  const [, refresh] = useReducer((count: number) => count + 1, 0)
  useEffect(() => {
    window.addEventListener('scroll', refresh, { capture: true, passive: true })
    window.addEventListener('resize', refresh)
    return () => {
      window.removeEventListener('scroll', refresh, { capture: true })
      window.removeEventListener('resize', refresh)
    }
  }, [])

  return peers.map(({ clientId, user, color, pointer }) => {
    if (clientId === awareness.clientID || !pointer || !isInside(pointer, visibleArea)) return null
    const position = paint.toClientPosition(pointer)
    if (!position) return null
    const style = { left: position.x, top: position.y, '--peer-color': peerColorVar(color) } as CSSProperties
    return (
      <div key={clientId} className={classes.pointer} style={style} aria-hidden>
        <svg viewBox='0 0 16 16' width='16' height='16' className={classes.pointerArrow} aria-hidden='true'>
          <path d='M1 1 L1 13 L4.5 9.5 L7 15 L9 14 L6.5 8.5 L11.5 8.5 Z' />
        </svg>
        <span className={classes.pointerLabel}>{user.name}</span>
      </div>
    )
  })
}

export default RemotePointers
