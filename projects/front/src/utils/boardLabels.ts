import { findClientApp } from '@front/apps'
import type { Board } from '@platform/model'
import { countByType } from './countByType'

/** Name of each board: the label of its app, numbered when the room holds several boards of the same app */
export const boardLabels = (boards: Board[]) => {
  const totals = countByType(boards)
  const seen = new Map<string, number>()
  return boards.map(board => {
    const rank = (seen.get(board.type) ?? 0) + 1
    seen.set(board.type, rank)
    const label = findClientApp(board.type)?.label ?? board.type
    return (totals.get(board.type) ?? 0) > 1 ? `${label} ${rank}` : label
  })
}
