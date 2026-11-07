import type { ExportedShape, ReactPaint, ShapesActionOptions } from '@yorab/react-paint'
import { useEffect } from 'react'
import type * as Y from 'yjs'
import { orderOf, readShapes, shapesOf, writeLocalChange } from './paintDoc'

// a change received is a step of the history: an undo cancels the last change of the board, whoever made it
const REMOTE_CHANGE: ShapesActionOptions = { source: 'remote', save: true }

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id, index) => id === b[index])

/**
 * Brings the drawing to the shapes of the document. `changedIds`: the shapes whose value changed in the document,
 * which are drawn again. A shape changed is removed and added back, at its place: its value is taken as a whole.
 */
const applyRemoteChange = (paint: ReactPaint, next: ExportedShape[], changedIds: Set<string>) => {
  const current = paint.getCurrentData().shapes ?? []
  const currentIds = new Set(current.map(shape => shape.id))
  const nextIds = new Set(next.map(shape => shape.id))

  paint.batch(() => {
    const removed = current.filter(shape => !nextIds.has(shape.id) || changedIds.has(shape.id)).map(shape => shape.id)
    if (removed.length > 0) paint.actions.removeShapes(removed, REMOTE_CHANGE)
    next.forEach((shape, index) => {
      if (currentIds.has(shape.id) && !changedIds.has(shape.id)) return
      try {
        // the id is kept: it is free, the shape was removed above
        paint.actions.addShapes([shape], { ...REMOTE_CHANGE, index, select: false })
      } catch (err) {
        console.error('Invalid shape received:', shape, err)
      }
    })
    const order = next.map(shape => shape.id)
    const drawn = (paint.getCurrentData().shapes ?? []).map(shape => shape.id)
    if (!sameIds(drawn, order)) paint.actions.reorderShapes(order)
  })
}

/**
 * Binds the drawing of `paint` to the Yjs document of the board: the shapes drawn go to the document, the shapes
 * changed by the others are applied to the drawing.
 */
export const usePaintDoc = (paint: ReactPaint, doc: Y.Doc) => {
  useEffect(() => {
    const shapes = shapesOf(doc)
    const order = orderOf(doc)
    let loading = true
    let changedWhileLoading = false
    let unmounted = false
    // set while the changes of the others are applied: the drawing then changes, but not from here
    let applyingRemote = false

    const onAfterTransaction = (transaction: Y.Transaction) => {
      if (transaction.local) return
      // the typings of Yjs do not accept a typed Y.Map as a key of `changed`
      const changedKeys = transaction.changed.get(shapes as unknown as Y.AbstractType<Y.YEvent<Y.Map<unknown>>>)
      if (!changedKeys && !transaction.changed.has(order)) return
      if (loading) {
        changedWhileLoading = true
        return
      }
      const changedIds = new Set([...(changedKeys ?? [])].filter(key => key !== null))
      applyingRemote = true
      try {
        applyRemoteChange(paint, readShapes(doc), changedIds)
      } finally {
        applyingRemote = false
      }
    }
    doc.on('afterTransaction', onAfterTransaction)

    // The source given by dataChanged is the one of the step of the history the drawing is on: an undo which goes back
    // to a change received comes as 'remote'. So every change is written, but the ones applied from the document:
    // writeLocalChange leaves out what the document already holds, so a late echo makes no update either.
    const unregister = paint.registerEvent('dataChanged', (data, _source, changes) => {
      if (loading || applyingRemote) return
      writeLocalChange(doc, data, changes)
    })

    // the drawing found on arrival is not a step of the history: undo cannot erase it
    const load = async () => {
      do {
        changedWhileLoading = false
        await paint.actions.loadData({ shapes: readShapes(doc) }, { clearHistory: true })
      } while (changedWhileLoading && !unmounted)
    }
    load()
      .catch(err => console.error('Drawing not loaded:', err))
      .finally(() => {
        loading = false
      })

    return () => {
      unmounted = true
      unregister()
      doc.off('afterTransaction', onAfterTransaction)
    }
  }, [paint, doc])
}
