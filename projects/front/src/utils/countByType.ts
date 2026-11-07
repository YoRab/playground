import type { Board } from '@platform/model'

/** How many boards of each app type a room holds */
export const countByType = (boards: Board[]) => {
  const counts = new Map<string, number>()
  for (const board of boards) counts.set(board.type, (counts.get(board.type) ?? 0) + 1)
  return counts
}
