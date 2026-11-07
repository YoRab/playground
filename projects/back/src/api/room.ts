import { randomUUID } from 'node:crypto'
import type { Board, RoomVisibility, User } from '@platform/model'

export type DBRoom = {
  id: string
  owner: string
  title: string
  visibility: RoomVisibility
  maxParticipants: number
  /** `salt:hash` (scrypt), only for a protected room */
  passwordHash: string | null
  /** Users admitted with the password (protected room) */
  members: string[]
  /** Users kicked out by the owner */
  banned: string[]
  createdAt: number
  boards: Board[]
}

/** What the owner can change after the creation */
export type DBRoomPatch = Partial<Pick<DBRoom, 'title' | 'visibility' | 'maxParticipants' | 'passwordHash' | 'members' | 'banned'>>

let rooms: DBRoom[] = []

const roomApi = {
  findMany: async () => rooms,

  findById: async (id: string) => rooms.find(room => room.id === id),

  findByBoardId: async (boardId: string) => rooms.find(room => room.boards.some(board => board.id === boardId)),

  create: async (data: { owner: User; title: string; visibility: RoomVisibility; maxParticipants: number; passwordHash: string | null }) => {
    const room: DBRoom = {
      id: randomUUID(),
      owner: data.owner.id,
      title: data.title,
      visibility: data.visibility,
      maxParticipants: data.maxParticipants,
      passwordHash: data.passwordHash,
      members: [],
      banned: [],
      createdAt: Date.now(),
      boards: []
    }
    rooms.push(room)
    return room
  },
  update: async (roomId: string, patch: DBRoomPatch) => {
    const roomIndex = rooms.findIndex(item => item.id === roomId)
    if (roomIndex < 0) return null

    rooms[roomIndex] = { ...rooms[roomIndex], ...patch }
    return rooms[roomIndex]
  },
  delete: async (data: { roomId: string }) => {
    rooms = rooms.filter(room => room.id !== data.roomId)
    return true
  },
  addBoard: async (data: { boardId: string; roomId: string; type: string }) => {
    const roomIndex = rooms.findIndex(item => item.id === data.roomId)

    if (roomIndex < 0) return null

    rooms[roomIndex] = {
      ...rooms[roomIndex],
      boards: [...rooms[roomIndex].boards, { type: data.type, id: data.boardId }]
    }
    return rooms[roomIndex]
  },
  removeBoard: async (data: { boardId: string; roomId: string }) => {
    const roomIndex = rooms.findIndex(item => item.id === data.roomId)
    if (roomIndex < 0) return null

    rooms[roomIndex] = {
      ...rooms[roomIndex],
      boards: rooms[roomIndex].boards.filter(board => board.id !== data.boardId)
    }
    return rooms[roomIndex]
  }
}

export default roomApi
