import { type DataChanges, type ExportedShape, type ShapesOrder, type StateData, shallowEqual } from '@yorab/react-paint'
import type * as Y from 'yjs'

/*
 * The drawing in the Yjs document of the board:
 * - `shapes`: the shapes of the drawing (not the shapes of the groups: a group holds them), by id. Each one is a JSON
 *   value written as a whole: two shapes changed at the same time merge, one shape changed twice keeps one version.
 * - `order`: their ids, from the foreground, like the shapes of react-paint.
 */

export const shapesOf = (doc: Y.Doc) => doc.getMap<ExportedShape>('shapes')
export const orderOf = (doc: Y.Doc) => doc.getArray<string>('order')
/** The settings shared by everyone on the board: the gap of the grid (`gridGap`) */
export const settingsOf = (doc: Y.Doc) => doc.getMap<number>('settings')

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

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** A shape of the tree with the id of its group (undefined for a shape of the drawing) */
type TreeNode = { shape: ExportedShape; parentId: string | undefined }

/** Every shape of the drawing, the ones of the groups too, by id, and the ids of each list (the drawing under undefined, then each group) */
const indexDrawing = (drawing: ExportedShape[]) => {
  const nodes = new Map<string, TreeNode>()
  const lists = new Map<string | undefined, string[]>()
  const walk = (list: ExportedShape[], parentId: string | undefined) => {
    lists.set(
      parentId,
      list.map(shape => shape.id)
    )
    for (const shape of list) {
      nodes.set(shape.id, { shape, parentId })
      if (shape.type === 'group') walk(shape.shapes, shape.id)
    }
  }
  walk(drawing, undefined)
  return { nodes, lists }
}

/** A group changes with its own fields and the ids of its shapes, not with the content of its shapes: they are listed apart */
const withoutContent = (shape: ExportedShape) => {
  if (shape.type !== 'group') return shape
  const { shapes, ...fields } = shape
  return { ...fields, shapes: shapes.map(({ id }) => id) }
}

/**
 * The changes which bring the drawing `previous` to `next`, in the format of the `dataChanged` event of react-paint, to be
 * applied with `actions.applyChanges`: it merges them field by field with what the user changed meanwhile.
 */
export const diffDrawings = (previous: ExportedShape[], next: ExportedShape[]): DataChanges => {
  const before = indexDrawing(previous)
  const after = indexDrawing(next)

  const added: ExportedShape[] = []
  const updated: DataChanges['updated'] = []
  const removed: ExportedShape[] = []
  for (const [id, { shape }] of after.nodes) {
    const was = before.nodes.get(id)
    if (!was) added.push(shape)
    // Yjs gives back the object it holds until the shape is written again: most shapes are the same one
    else if (was.shape !== shape && !sameValue(withoutContent(was.shape), withoutContent(shape))) updated.push({ shape, previous: was.shape })
  }
  for (const [id, { shape }] of before.nodes) if (!after.nodes.has(id)) removed.push(shape)

  // the lists whose ids changed, the drawing first and each group after the list holding it
  const order: ShapesOrder[] = []
  for (const [parentId, ids] of after.lists) if (!shallowEqual(ids, before.lists.get(parentId))) order.push({ parentId, ids })

  // whether the shapes kept moved: to another group, or in another order among the shapes of their list kept too
  const kept = (ids: string[] | undefined) => (ids ?? []).filter(id => before.nodes.has(id) && after.nodes.has(id))
  const changedGroup = () => {
    for (const [id, { parentId }] of after.nodes) {
      const was = before.nodes.get(id)
      if (was && was.parentId !== parentId) return true
    }
    return false
  }
  const reordered =
    order.length > 0 && (changedGroup() || order.some(({ parentId, ids }) => !shallowEqual(kept(ids), kept(before.lists.get(parentId)))))

  return { added, updated, removed, reordered, order }
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

/** What writeLocalChange needs of the changes of react-paint: the shapes removed are only known by their ids */
export type LocalChanges = Pick<DataChanges, 'added' | 'updated' | 'reordered'> & { removed: { id: string }[] }

/**
 * Writes a change of the local drawing (the arguments of the `dataChanged` event of react-paint) to the document.
 * Only what the change touches is written: a shape received from another client in the meantime is left alone.
 * What the document already holds is not written again: the echo of a change received makes no update.
 */
export const writeLocalChange = (doc: Y.Doc, data: StateData, changes: LocalChanges) => {
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
