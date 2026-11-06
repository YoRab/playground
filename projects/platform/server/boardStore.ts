import { randomUUID } from 'node:crypto'

export type BoardRecord<T> = {
  id: string
  roomId: string
  owner: string
  data: T
  createdAt: number
  updatedAt: number | null
}

/** In-memory storage of the boards of one app: each board holds a `data` value of type T */
export const createBoardStore = <T>(initial: () => T) => {
  const records = new Map<string, BoardRecord<T>>()

  return {
    find: (id: string) => records.get(id),

    create: ({ roomId, owner }: { roomId: string; owner: string }) => {
      const record: BoardRecord<T> = { id: randomUUID(), roomId, owner, data: initial(), createdAt: Date.now(), updatedAt: null }
      records.set(record.id, record)
      return record
    },

    update: (id: string, update: (data: T) => T) => {
      const record = records.get(id)
      if (!record) return undefined
      const updated = { ...record, data: update(record.data), updatedAt: Date.now() }
      records.set(id, updated)
      return updated
    },

    remove: (id: string) => records.delete(id)
  }
}
