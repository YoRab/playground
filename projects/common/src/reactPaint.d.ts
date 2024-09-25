import type { User } from '@common/model'

export type ReactPaint = {
  id: string
  sessionId: string
  owner: User
  data: unknown
  createdAt: number
  updatedAt: number | null
}
