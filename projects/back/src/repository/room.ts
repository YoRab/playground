import roomApi, { type DBRoom } from '@back/api/room'
import userApi from '@back/api/user'
import type { Room } from '@common/model'

const resolveUsers = async (room?: DBRoom): Promise<Room | undefined> => {
  if (room === undefined) return undefined

  const owner = await userApi.findById(room.owner)
  const watchers = (await Promise.all(room.watchers.map(async ([_socketId, userId]) => await userApi.findById(userId)))).filter(
    (user, index, array) => !!user && array.indexOf(user) === index
  ) as Room['watchers']

  return {
    ...room,
    owner,
    watchers
  }
}

export const findMany = async (): Promise<Room[]> => {
  const rooms = await roomApi.findMany()
  const promises = rooms.map(async room => (await resolveUsers(room))!)
  return Promise.all(promises)
}

export const findRoomById = async (id: string): Promise<Room | undefined> => {
  const room = await roomApi.findById(id)
  return resolveUsers(room)
}

export const createRoom = async (ownerId: string): Promise<Room | undefined> => {
  const userFound = await userApi.findById(ownerId)
  if (!userFound) {
    return
  }
  const room = await roomApi.create({ owner: userFound })
  return resolveUsers(room)
}

export const deleteRoom = async (roomId: string, ownerId: string): Promise<boolean> => {
  const room = await roomApi.findById(roomId)
  if (!room) {
    return false
  }

  const userFound = await userApi.findById(ownerId)
  if (!userFound) {
    return false
  }

  if (room.owner !== ownerId) return false

  await roomApi.delete({ roomId: roomId })
  return true
}

export const addWatcher = async (roomId: string, socketId: string, watcherId: string): Promise<Room | undefined> => {
  const room = await roomApi.findById(roomId)
  if (!room) {
    return
  }

  const userFound = await userApi.findById(watcherId)
  if (!userFound) {
    return resolveUsers(room!)
  }
  const refreshedSession = await roomApi.addWatcher({
    socketId: socketId,
    userId: watcherId,
    roomId: roomId
  })

  return resolveUsers(refreshedSession!)
}

export const removeWatcher = async (roomId: string, socketId: string): Promise<Room | undefined> => {
  const room = await roomApi.findById(roomId)
  if (!room) {
    return
  }

  const refreshedRoom = await roomApi.removeWatcher({
    socketId,
    roomId: roomId
  })
  return resolveUsers(refreshedRoom!)
}

export const addBoard = async (roomId: string, boardId: string, ownerId: string, type: string): Promise<Room | undefined | false> => {
  const room = await roomApi.findById(roomId)
  if (!room) return false

  const userFound = await userApi.findById(ownerId)
  if (!userFound) return false

  if (room.owner !== ownerId) return false

  const refreshedRoom = await roomApi.addBoard({
    type,
    boardId,
    roomId: roomId
  })

  return resolveUsers(refreshedRoom!)
}

export const removeBoard = async (roomId: string, boardId: string, ownerId: string): Promise<Room | undefined | false> => {
  const room = await roomApi.findById(roomId)
  if (!room) return false

  const userFound = await userApi.findById(ownerId)
  if (!userFound) return false

  if (room.owner !== ownerId) return false

  const refreshedRoom = await roomApi.removeBoard({
    boardId,
    roomId: roomId
  })
  return resolveUsers(refreshedRoom!)
}
