import { useAppTexts } from '@front/hooks/useAppTexts'
import { countByType } from '@front/utils/countByType'
import type { Board } from '@platform/model'

/** Name of each board: the label of its app, numbered when the room holds several boards of the same app */
export const useBoardLabels = (boards: Board[]) => {
  const appTexts = useAppTexts()
  const totals = countByType(boards)
  const seen = new Map<string, number>()
  return boards.map(board => {
    const rank = (seen.get(board.type) ?? 0) + 1
    seen.set(board.type, rank)
    const { label } = appTexts(board.type)
    return (totals.get(board.type) ?? 0) > 1 ? `${label} ${rank}` : label
  })
}
