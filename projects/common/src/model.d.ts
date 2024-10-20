export type User = {
  id: string
  pseudo: string
}

export type Room = {
  id: string
  owner?: User | null
  title: string
  watchers: User[]
  createdAt: number
  boards: { type: string; id: string }[]
}
