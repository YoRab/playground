import type { DBUser } from '@back/api/user'
import { v4 as uuidv4 } from 'uuid'

export type DBRoom = {
  id: string
  owner: string
  title: string
  watchers: [string, string][]
  createdAt: number
  boards: { type: string; id: string }[]
}

let rooms: DBRoom[] = []

const gameApi = {
  findMany: async () => rooms,

  findById: async (id: string) => rooms.find(room => room.id === id),

  create: async (data: { owner: DBUser }) => {
    const room: DBRoom = {
      id: uuidv4(),
      owner: data.owner.id,
      title: `${data.owner.pseudo}'s room`,
      watchers: [],
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
  addWatcher: async (data: { socketId: string; userId: string; roomId: string }) => {
    const roomIndex = rooms.findIndex(item => item.id === data.roomId)
    if (roomIndex < 0) return null

    const isSocketAlreadyRegistered = rooms[roomIndex].watchers.find(([socket, _user]) => socket === data.socketId) !== undefined
    if (isSocketAlreadyRegistered) return rooms[roomIndex]

    rooms[roomIndex] = {
      ...rooms[roomIndex],
      watchers: [...rooms[roomIndex].watchers, [data.socketId, data.userId]]
    }
    return rooms[roomIndex]
  },
  removeWatcher: async (data: { socketId: string; roomId: string }) => {
    const roomIndex = rooms.findIndex(item => item.id === data.roomId)
    if (roomIndex < 0) return null

    rooms[roomIndex] = {
      ...rooms[roomIndex],
      watchers: rooms[roomIndex].watchers.filter(([socket, _user]) => socket !== data.socketId)
    }
    return rooms[roomIndex]
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

export default gameApi
