import type { DataChanges, ExportedShape, StateData } from '@yorab/react-paint'
import type * as Y from 'yjs'

/*
 * The drawing in the Yjs document of the board:
 * - `shapes`: the shapes of the drawing (not the shapes of the groups: a group holds them), by id. Each one is a JSON
 *   value written as a whole: two shapes changed at the same time merge, one shape changed twice keeps one version.
 * - `order`: their ids, from the foreground, like the shapes of react-paint.
 */

export const shapesOf = (doc: Y.Doc) => doc.getMap<ExportedShape>('shapes')
export const orderOf = (doc: Y.Doc) => doc.getArray<string>('order')

/**
 * The shapes of the drawing, from the foreground. Every client gets the same list from the same document:
 * ids repeated by concurrent reorderings are taken once, and the shapes missing from the order go to the background.
 */
export const readShapes = (doc: Y.Doc): ExportedShape[] => {
  const shapes = shapesOf(doc)
  const listed = new Set<string>()
  const result: ExportedShape[] = []
  const take = (id: string) => {
    const shape = shapes.get(id)
    if (!shape || listed.has(id)) return
    listed.add(id)
    result.push(shape)
  }
  for (const id of orderOf(doc)) take(id)
  // the keys of a Y.Map come in an order of their own on each client: sorted to stay the same everywhere
  if (listed.size < shapes.size) for (const id of [...shapes.keys()].sort()) take(id)
  return result
}

/**
 * Changes `yarray` into `next` by replacing what lies between their common prefix and suffix: an id inserted
 * at the same time by someone else is kept.
 */
const applyArrayDiff = (yarray: Y.Array<string>, next: string[]) => {
  const current = yarray.toArray()
  const max = Math.min(current.length, next.length)
  let start = 0
  while (start < max && current[start] === next[start]) start++
  let end = 0
  while (end < max - start && current[current.length - 1 - end] === next[next.length - 1 - end]) end++
  const removed = current.length - start - end
  if (removed > 0) yarray.delete(start, removed)
  const inserted = next.slice(start, next.length - end)
  if (inserted.length > 0) yarray.insert(start, inserted)
}

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Writes a change of the local drawing (the arguments of the `dataChanged` event of react-paint) to the document.
 * Only what the change touches is written: a shape received from another client in the meantime is left alone.
 * What the document already holds is not written again: the echo of a change received makes no update.
 */
export const writeLocalChange = (doc: Y.Doc, data: StateData, changes: DataChanges) => {
  const drawing = data.shapes ?? []
  // id of every shape, a shape of a group too → id of the shape of the drawing which holds it
  const rootOf = new Map<string, string>()
  const walk = (shape: ExportedShape, rootId: string) => {
    rootOf.set(shape.id, rootId)
    if (shape.type === 'group') for (const child of shape.shapes) walk(child, rootId)
  }
  for (const shape of drawing) walk(shape, shape.id)

  // a change of order may also move shapes into a group or out of it: every shape is written again then
  const touched = changes.reordered
    ? new Set(drawing.map(shape => shape.id))
    : new Set([...changes.added, ...changes.updated.map(({ shape }) => shape)].flatMap(shape => rootOf.get(shape.id) ?? []))

  doc.transact(() => {
    const shapes = shapesOf(doc)
    for (const { id } of changes.removed) {
      if (rootOf.get(id) !== id) shapes.delete(id)
    }
    if (changes.reordered) {
      // the shapes which went into a group are not shapes of the drawing anymore
      for (const [id, rootId] of rootOf) if (id !== rootId) shapes.delete(id)
    }
    for (const shape of drawing) {
      if (touched.has(shape.id) && !sameValue(shapes.get(shape.id), shape)) shapes.set(shape.id, shape)
    }
    applyArrayDiff(
      orderOf(doc),
      drawing.map(shape => shape.id)
    )
  })
}
