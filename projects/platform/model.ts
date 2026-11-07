export type User = {
  id: string
  pseudo: string
}

export type Board = {
  /** App type, see the app registries (back/src/apps.ts, front/src/apps.ts) */
  type: string
  id: string
}

/** Who may enter a room: anyone, whoever knows its password, or its owner only */
export const ROOM_VISIBILITIES = ['public', 'protected', 'private'] as const
export type RoomVisibility = (typeof ROOM_VISIBILITIES)[number]

/** Bounds of the room settings, checked by the server and by the settings form */
export const ROOM_LIMITS = {
  title: 60,
  minParticipants: 2,
  maxParticipants: 50,
  defaultParticipants: 8,
  passwordMin: 4,
  passwordMax: 64
} as const

export type Room = {
  id: string
  owner?: User | null
  title: string
  visibility: RoomVisibility
  /** Most users in the room at the same time, owner included (the owner always gets in) */
  maxParticipants: number
  /** Users currently connected to the room (computed from presence, never stored) */
  watchers: User[]
  createdAt: number
  boards: Board[]
  /** Users the owner kicked out: they cannot come back until the owner lets them in. Sent to the owner only. */
  banned?: User[]
}

/** Why a user cannot enter a room (yet) */
export type RoomLockReason = 'password' | 'full' | 'private' | 'banned'

/** What a user who cannot enter a room sees of it */
export type LockedRoom = Pick<Room, 'id' | 'title' | 'owner' | 'visibility' | 'maxParticipants'> & {
  /** Users currently in the room */
  participants: number
}

/** What the room subscription yields: the room once in, or why the user is kept out (re-evaluated on every change) */
export type RoomView = { status: 'joined'; room: Room } | { status: 'locked'; reason: RoomLockReason; room: LockedRoom }
