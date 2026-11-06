import { randomUUID } from 'node:crypto'
import type { User } from '../model'

// In-memory, like every store of the playground
const records = new Map<string, User>()

export const users = {
  findMany: () => [...records.values()],
  findById: (id: string) => records.get(id) ?? null,
  findByPseudo: (pseudo: string) => [...records.values()].find(user => user.pseudo === pseudo) ?? null,
  create: (data: { pseudo: string }) => {
    const user: User = { id: randomUUID(), ...data }
    records.set(user.id, user)
    return user
  }
}
