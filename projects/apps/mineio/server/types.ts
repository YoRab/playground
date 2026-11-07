import type { BotLevel, GameSettings, MineEvent, ViewJson } from '@yorab/mine.io/engine'

/** Who sits in a corner, as stored */
export type SeatEntry = { kind: 'human'; userId: string } | { kind: 'bot'; level: BotLevel }

/** Who sits in a corner, as shown */
export type LobbySeat = { kind: 'human'; userId: string; name: string } | { kind: 'bot'; level: BotLevel; name: string }

/** Everything about a board but its grid */
export type Lobby = {
  ownerId: string
  settings: GameSettings
  /** One per corner, null when free */
  seats: (LobbySeat | null)[]
  /** A game was started (it may be over: see the status of the view) */
  playing: boolean
}

/**
 * What the `sync` subscription sends. A snapshot replaces everything (first message, then on every change of the lobby);
 * events follow it, numbered: a client that sees a gap in `seq` subscribes again. Hovers are not numbered (nothing to miss).
 */
export type MineMessage =
  | { type: 'snapshot'; seq: number; lobby: Lobby; view: ViewJson | null; hovers: (number | null)[] }
  | { type: 'events'; seq: number; events: MineEvent[] }
  | { type: 'hover'; seat: number; cell: number | null }
