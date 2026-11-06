import { randomUUID } from 'node:crypto'
import type { Board, User } from '@platform/model'

export type DBRoom = {
  id: string
  owner: string
  title: string
  createdAt: number
  boards: Board[]
}

let rooms: DBRoom[] = []

const roomApi = {
  findMany: async () => rooms,

  findById: async (id: string) => rooms.find(room => room.id === id),

  create: async (data: { owner: User }) => {
    const room: DBRoom = {
      id: randomUUID(),
      owner: data.owner.id,
      title: `${data.owner.pseudo}'s room`,
      createdAt: Date.now(),
      boards: []
    }
    rooms.push(room)
    return room
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
