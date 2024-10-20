import type { User } from '@common/model'

export type Word = {
  id: string
  roomId: string
  owner: User
  word: string
  createdAt: number
  updatedAt: number | null
}
