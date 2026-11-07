import roomApi, { type DBRoom } from '@back/api/room'
import { roomPresence } from '@back/services/rooms'
import type { Room } from '@platform/model'
import { users } from '@platform/server'

const toRoom = (room: DBRoom): Room => ({
  ...room,
  owner: users.findById(room.owner),
  watchers: roomPresence.list(room.id).flatMap(id => users.findById(id) ?? [])
})

export const findMany = async (): Promise<Room[]> => {
  const rooms = await roomApi.findMany()
  return rooms.map(toRoom)
}

export const findRoomById = async (id: string): Promise<Room | undefined> => {
  const room = await roomApi.findById(id)
  return room && toRoom(room)
}

export const createRoom = async (ownerId: string): Promise<Room | undefined> => {
  const userFound = users.findById(ownerId)
  if (!userFound) {
    return
  }
  const room = await roomApi.create({ owner: userFound })
  return toRoom(room)
}

export const renameRoom = async (roomId: string, title: string, ownerId: string): Promise<boolean> => {
  const room = await roomApi.findById(roomId)
  if (!room) return false
  if (room.owner !== ownerId) return false

  return !!(await roomApi.rename({ roomId, title }))
}

export const deleteRoom = async (roomId: string, ownerId: string): Promise<boolean> => {
  const room = await roomApi.findById(roomId)
  if (!room) return false
  if (room.owner !== ownerId) return false

  await roomApi.delete({ roomId: roomId })
  return true
}

export const addBoard = async (roomId: string, boardId: string, ownerId: string, type: string): Promise<Room | undefined | false> => {
  const room = await roomApi.findById(roomId)
  if (!room) return false
  if (room.owner !== ownerId) return false

  const refreshedRoom = await roomApi.addBoard({ type, boardId, roomId })
  return refreshedRoom ? toRoom(refreshedRoom) : undefined
}

export const removeBoard = async (roomId: string, boardId: string, ownerId: string): Promise<Room | undefined | false> => {
  const room = await roomApi.findById(roomId)
  if (!room) return false
  if (room.owner !== ownerId) return false

  const refreshedRoom = await roomApi.removeBoard({ boardId, roomId })
  return refreshedRoom ? toRoom(refreshedRoom) : undefined
}
