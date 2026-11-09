import type { ExportedShape, ReactPaint } from '@yorab/react-paint'
import { useEffect } from 'react'
import type * as Y from 'yjs'
import { diffDrawings, type LocalChanges, orderOf, readShapes, settingsOf, shapesOf, writeLocalChange } from './paintDoc'

// the moves of a gesture are written to the document as they come, at most once in this delay
const LIVE_DELAY_MS = 50

/**
 * Binds the drawing of `paint` to the Yjs document of the board: the shapes drawn go to the document, the shapes
 * changed by the others are applied to the drawing, and so is the grid.
 *
 * Each user has their own history: the changes received are not steps of it, an undo cancels the last step of the user
 * and keeps what the others did since. The others see a gesture while it is made: its moves are written to the
 * document too (a shape drawn halfway is what a client leaving in the middle of a gesture leaves behind).
 */
export const usePaintDoc = (paint: ReactPaint, doc: Y.Doc) => {
  useEffect(() => {
    const shapes = shapesOf(doc)
    const order = orderOf(doc)
    const settings = settingsOf(doc)
    let loading = true
    let changedWhileLoading = false
    let unmounted = false
    // the shapes of the document the drawing is in line with: what the others change is the difference with the document
    // now, which applyChanges merges with the changes of the user which are not in the document yet
    let known: ExportedShape[] = []

    // the grid of the document is applied when it differs: the event gridChanged it fires finds the document up to date
    const applyGrid = () => {
      const gridGap = settings.get('gridGap')
      if (gridGap !== undefined && gridGap !== paint.getState().gridGap) paint.actions.setGridGap(gridGap)
    }

    const onAfterTransaction = (transaction: Y.Transaction) => {
      // the typings of Yjs do not accept a typed Y.Map as a key of `changed`
      const changed = (type: object) => transaction.changed.has(type as unknown as Y.AbstractType<Y.YEvent<Y.Map<unknown>>>)
      const drawingChanged = changed(shapes) || changed(order)
      // a change written by this client: it is already drawn
      if (transaction.local) {
        if (!loading && drawingChanged) known = readShapes(doc)
        return
      }
      if (changed(settings)) applyGrid()
      if (!drawingChanged) return
      if (loading) {
        changedWhileLoading = true
        return
      }
      const next = readShapes(doc)
      const changes = diffDrawings(known, next)
      known = next
      try {
        // a remote change, saved: dataChanged gives it with the source 'remote' and it is not written back
        paint.actions.applyChanges(changes)
      } catch (err) {
        console.error('Invalid shape received:', changes, err)
      }
    }
    doc.on('afterTransaction', onAfterTransaction)

    // the shapes touched by the gesture of the user since the last write, as they were last seen (null: removed)
    const touched = new Map<string, ExportedShape | null>()
    let touchedOrder = false
    let liveTimer: ReturnType<typeof setTimeout> | undefined
    const writeLive = () => {
      clearTimeout(liveTimer)
      liveTimer = undefined
      if (touched.size === 0) return
      const changes: LocalChanges = { added: [], updated: [], removed: [], reordered: touchedOrder }
      for (const [id, shape] of touched) {
        if (shape) changes.added.push(shape)
        else changes.removed.push({ id })
      }
      touched.clear()
      touchedOrder = false
      writeLocalChange(doc, paint.getCurrentData(), changes)
    }

    // The moves of a gesture, which are not saved yet. The changes the drawing makes by itself are the ones of the user,
    // undo and redo included ('user'): the ones applied from the document ('remote') are not written back.
    const unregisterLive = paint.registerEvent('shapesChanged', (_shapes, source, changes) => {
      if (loading || source === 'remote') return
      for (const shape of changes.added) touched.set(shape.id, shape)
      for (const { shape } of changes.updated) touched.set(shape.id, shape)
      for (const shape of changes.removed) touched.set(shape.id, null)
      touchedOrder ||= changes.reordered
      liveTimer ??= setTimeout(writeLive, LIVE_DELAY_MS)
    })

    // a step saved: what the gesture left to write goes first. writeLocalChange leaves out what the document already holds.
    const unregisterSaved = paint.registerEvent('dataChanged', (data, source, changes) => {
      if (loading || source === 'remote') return
      writeLive()
      writeLocalChange(doc, data, changes)
    })

    // the grid is shared: set by the user, it goes to the document
    const unregisterGrid = paint.registerEvent('gridChanged', gridGap => {
      if (loading || settings.get('gridGap') === gridGap) return
      settings.set('gridGap', gridGap)
    })

    // the drawing found on arrival is not a step of the history: undo cannot erase it
    const load = async () => {
      applyGrid()
      do {
        changedWhileLoading = false
        known = readShapes(doc)
        await paint.actions.loadData({ shapes: known }, { clearHistory: true })
      } while (changedWhileLoading && !unmounted)
    }
    load()
      .catch(err => console.error('Drawing not loaded:', err))
      .finally(() => {
        loading = false
      })

    return () => {
      unmounted = true
      clearTimeout(liveTimer)
      unregisterLive()
      unregisterSaved()
      unregisterGrid()
      doc.off('afterTransaction', onAfterTransaction)
    }
  }, [paint, doc])
}
