import type { User } from '@common/model'

export type ReactPaint = {
  id: string
  roomId: string
  owner: User
  data: unknown
  createdAt: number
  updatedAt: number | null
}
