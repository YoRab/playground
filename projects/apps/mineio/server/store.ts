import { createBoardStore, createTopic } from '@platform/server'
import { DEFAULT_SETTINGS, type GameSettings, type Match, SEAT_COUNT } from '@yorab/mine.io/engine'
import type { MineMessage, SeatEntry } from './types'

/** The live state of a board: mutated in place (it holds the running match, with its bots and timers) */
export type MineSession = {
  settings: GameSettings
  seats: (SeatEntry | null)[]
  /** The authority of the current game (hidden mines included), null in the lobby */
  match: Match | null
  /** Number of the last message published */
  seq: number
  hovers: (number | null)[]
}

export const boards = createBoardStore<MineSession>(() => ({
  settings: DEFAULT_SETTINGS,
  seats: new Array(SEAT_COUNT).fill(null),
  match: null,
  seq: 0,
  hovers: new Array(SEAT_COUNT).fill(null)
}))

/** Everything that happens on a board: key = boardId */
export const boardTopic = createTopic<MineMessage>('mineio')
