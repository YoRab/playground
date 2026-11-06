import * as Y from 'yjs'
import { z } from 'zod'

/**
 * What Word adds to the awareness state: the selection in the text, as Yjs relative positions (JSON), which follow
 * the text as it changes. Null outside of the textarea, and before the first focus.
 */
export const cursorStateSchema = z.object({ cursor: z.object({ anchor: z.unknown(), head: z.unknown() }).nullable().catch(null) })

/** Relative position (JSON) of an index of `ytext`, attached to the character on its left like the local caret */
export const toRelativePosition = (ytext: Y.Text, index: number): unknown =>
  Y.relativePositionToJSON(Y.createRelativePositionFromTypeIndex(ytext, index, -1))

/** Current index of a relative position received from a peer, or null when it cannot be resolved */
export const toIndex = (doc: Y.Doc, position: unknown): number | null => {
  try {
    return Y.createAbsolutePositionFromRelativePosition(Y.createRelativePositionFromJSON(position), doc)?.index ?? null
  } catch {
    return null
  }
}
