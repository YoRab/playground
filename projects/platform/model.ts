export type User = {
  id: string
  pseudo: string
}

export type Board = {
  /** App type, see the app registries (back/src/apps.ts, front/src/apps.ts) */
  type: string
  id: string
}

export type Room = {
  id: string
  owner?: User | null
  title: string
  /** Users currently connected to the room (computed from presence, never stored) */
  watchers: User[]
  createdAt: number
  boards: Board[]
}
