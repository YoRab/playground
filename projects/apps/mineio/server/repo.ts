import { i18nError, users } from '@platform/server'
import {
  BOT_LEVEL_LABELS,
  type BotLevel,
  createConfig,
  createMatch,
  encodeView,
  type GameSettings,
  type RevealResult,
  SEAT_COUNT,
  type Seats
} from '@yorab/mine.io/engine'
import { boards, boardTopic } from './store'
import type { Lobby, MineMessage } from './types'

type BoardRecord = NonNullable<ReturnType<typeof boards.find>>

/** An error that the client translates with the dictionaries of the app (`errors.<key>`) */
const fail = (code: 'NOT_FOUND' | 'FORBIDDEN' | 'BAD_REQUEST', key: string, message: string) => i18nError(code, `mineio:errors.${key}`, message)

const findBoard = (boardId: string): BoardRecord => {
  const record = boards.find(boardId)
  if (!record) throw fail('NOT_FOUND', 'boardNotFound', 'Unknown mine.io board')
  return record
}

const requireOwner = (record: BoardRecord, userId: string) => {
  if (record.owner !== userId) throw fail('FORBIDDEN', 'ownerOnly', 'Only the owner of the board can do this')
}

const requireLobby = (record: BoardRecord) => {
  if (record.data.match) throw fail('BAD_REQUEST', 'alreadyStarted', 'The game has already started')
}

/** The corner of a user, or -1 */
const seatOf = (record: BoardRecord, userId: string) => record.data.seats.findIndex(seat => seat?.kind === 'human' && seat.userId === userId)

const botName = (level: BotLevel) => `${BOT_LEVEL_LABELS[level]} bot`

const lobbyOf = (record: BoardRecord): Lobby => ({
  ownerId: record.owner,
  settings: record.data.settings,
  playing: record.data.match !== null,
  seats: record.data.seats.map(seat => {
    if (!seat) return null
    if (seat.kind === 'bot') return { kind: 'bot', level: seat.level, name: botName(seat.level) }
    return { kind: 'human', userId: seat.userId, name: users.findById(seat.userId)?.pseudo ?? 'Unknown player' }
  })
})

/** The whole board as a player may see it: never the hidden mines */
const snapshotOf = (record: BoardRecord): Extract<MineMessage, { type: 'snapshot' }> => ({
  type: 'snapshot',
  seq: record.data.seq,
  lobby: lobbyOf(record),
  view: record.data.match ? encodeView(record.data.match.view()) : null,
  hovers: record.data.hovers
})

const publishSnapshot = (record: BoardRecord) => {
  record.data.seq++
  boardTopic.publish(record.id, snapshotOf(record))
}

const publishHover = (record: BoardRecord, seat: number, cell: number | null) => {
  if (record.data.hovers[seat] === cell) return
  record.data.hovers = record.data.hovers.map((current, index) => (index === seat ? cell : current))
  boardTopic.publish(record.id, { type: 'hover', seat, cell })
}

export const boardSnapshot = (boardId: string) => snapshotOf(findBoard(boardId))

export const createBoard = ({ ownerId, roomId }: { ownerId: string; roomId: string }) => ({ id: boards.create({ roomId, owner: ownerId }).id })

export const removeBoard = ({ boardId, userId }: { boardId: string; userId: string }) => {
  const record = boards.find(boardId)
  if (record?.owner !== userId) return false
  // stops the bots for good
  record.data.match?.dispose()
  return boards.remove(boardId)
}

export const takeSeat = (boardId: string, userId: string, seat: number) => {
  const record = findBoard(boardId)
  requireLobby(record)
  if (record.data.seats[seat]) throw fail('BAD_REQUEST', 'cornerTaken', 'This corner is taken')
  // a player has one corner: taking another one moves them
  const previous = seatOf(record, userId)
  if (previous >= 0) record.data.seats[previous] = null
  record.data.seats[seat] = { kind: 'human', userId }
  publishSnapshot(record)
}

export const leaveSeat = (boardId: string, userId: string) => {
  const record = findBoard(boardId)
  requireLobby(record)
  const seat = seatOf(record, userId)
  if (seat < 0) return
  record.data.seats[seat] = null
  publishSnapshot(record)
}

export const addBot = (boardId: string, userId: string, seat: number, level: BotLevel) => {
  const record = findBoard(boardId)
  requireOwner(record, userId)
  requireLobby(record)
  if (record.data.seats[seat]) throw fail('BAD_REQUEST', 'cornerTaken', 'This corner is taken')
  record.data.seats[seat] = { kind: 'bot', level }
  publishSnapshot(record)
}

export const removeBot = (boardId: string, userId: string, seat: number) => {
  const record = findBoard(boardId)
  requireOwner(record, userId)
  requireLobby(record)
  if (record.data.seats[seat]?.kind !== 'bot') return
  record.data.seats[seat] = null
  publishSnapshot(record)
}

export const updateSettings = (
  boardId: string,
  userId: string,
  { preset, density, diagonals, chording }: { [Key in keyof GameSettings]?: GameSettings[Key] | undefined }
) => {
  const record = findBoard(boardId)
  requireOwner(record, userId)
  requireLobby(record)
  const settings = { ...record.data.settings }
  if (preset !== undefined) settings.preset = preset
  if (density !== undefined) settings.density = density
  if (diagonals !== undefined) settings.diagonals = diagonals
  if (chording !== undefined) settings.chording = chording
  record.data.settings = settings
  publishSnapshot(record)
}

export const startGame = (boardId: string, userId: string) => {
  const record = findBoard(boardId)
  requireOwner(record, userId)
  requireLobby(record)
  const lobby = lobbyOf(record)
  if (lobby.seats.filter(Boolean).length < 2) throw fail('BAD_REQUEST', 'twoPlayersNeeded', 'A game needs at least two players')

  const seats: Seats = lobby.seats.map(seat => {
    if (!seat) return null
    return seat.kind === 'bot' ? { kind: 'bot', name: seat.name, level: seat.level } : { kind: 'human', name: seat.name }
  })
  // the board may have been removed, or the game replaced, while the match was running
  const liveRecord = () => {
    const current = boards.find(boardId)
    return current?.data.match === match ? current : undefined
  }
  const match = createMatch({
    config: createConfig(record.data.settings),
    seats,
    onEvents: events => {
      const current = liveRecord()
      if (!current) return
      current.data.seq++
      boardTopic.publish(boardId, { type: 'events', seq: current.data.seq, events })
    },
    onHover: (seat, cell) => {
      const current = liveRecord()
      if (current) publishHover(current, seat, cell)
    }
  })
  record.data.match = match
  publishSnapshot(record)
  match.start()
}

/** Back to the lobby with the same corners: after a game, or to stop the current one */
export const backToLobby = (boardId: string, userId: string) => {
  const record = findBoard(boardId)
  requireOwner(record, userId)
  if (!record.data.match) return
  record.data.match.dispose()
  record.data.match = null
  record.data.hovers = new Array(SEAT_COUNT).fill(null)
  publishSnapshot(record)
}

/** The events of an accepted move are published by the match itself */
export const reveal = (boardId: string, userId: string, cell: number): RevealResult => {
  const record = findBoard(boardId)
  const match = record.data.match
  if (!match) throw fail('BAD_REQUEST', 'notStarted', 'The game has not started')
  const seat = seatOf(record, userId)
  if (seat < 0) throw fail('FORBIDDEN', 'notPlaying', 'You are not playing this game')
  return match.reveal(seat, cell)
}

export const hover = (boardId: string, userId: string, cell: number | null) => {
  const record = findBoard(boardId)
  const seat = seatOf(record, userId)
  if (seat >= 0 && record.data.match) publishHover(record, seat, cell)
}
