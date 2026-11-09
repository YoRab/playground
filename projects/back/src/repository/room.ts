import roomApi, { type DBRoom } from '@back/api/room'
import { roomPresence } from '@back/services/rooms'
import { hashPassword, verifyPassword } from '@back/utils/password'
import type { LockedRoom, Room, RoomLockReason, RoomView, RoomVisibility } from '@platform/model'
import { i18nError, users } from '@platform/server'

/** What the owner chooses when creating a room, and can change afterwards. `password`: a new one (protected room only). */
type RoomSettings = {
  title: string
  visibility: RoomVisibility
  maxParticipants: number
  password?: string | undefined
}

const resolveUsers = (ids: string[]) => ids.flatMap(id => users.findById(id) ?? [])

/** What the clients see of a room: never its password nor its members; the banned users for its owner only */
const toRoom = (room: DBRoom, viewerId?: string | null): Room => {
  const { passwordHash: _passwordHash, members: _members, banned, ...data } = room
  return {
    ...data,
    owner: users.findById(room.owner),
    watchers: resolveUsers(roomPresence.list(room.id)),
    ...(viewerId === room.owner ? { banned: resolveUsers(banned) } : {})
  }
}

/** What a user kept out of a room sees of it */
const toLockedRoom = (room: DBRoom): LockedRoom => ({
  id: room.id,
  title: room.title,
  owner: users.findById(room.owner),
  visibility: room.visibility,
  maxParticipants: room.maxParticipants,
  participants: roomPresence.list(room.id).length
})

/** Why `userId` is not allowed in `room` whatever the number of people in it, or null: what the boards of the room check too */
const accessReason = (room: DBRoom, userId: string): Exclude<RoomLockReason, 'full'> | null => {
  if (room.owner === userId) return null
  if (room.banned.includes(userId)) return 'banned'
  if (room.visibility === 'private') return 'private'
  if (room.visibility === 'protected' && !room.members.includes(userId)) return 'password'
  return null
}

/**
 * Why `userId` cannot be in `room`, or null when they can. The capacity only stops newcomers: a user already in the room
 * (from another tab, or before the owner lowered the limit) stays.
 */
const lockReason = (room: DBRoom, userId: string): RoomLockReason | null => {
  const reason = accessReason(room, userId)
  if (reason || room.owner === userId) return reason
  const present = roomPresence.list(room.id)
  return !present.includes(userId) && present.length >= room.maxParticipants ? 'full' : null
}

const notFound = () => i18nError('NOT_FOUND', 'host:errors.room.notFound', 'This room does not exist (anymore)')

/** The hash of the password of a protected room, null for the others */
const hashIfProtected = ({ visibility, password }: RoomSettings) => (visibility === 'protected' && password ? hashPassword(password) : null)

/** The room, when `ownerId` owns it */
const findOwnedRoom = async (roomId: string, ownerId: string) => {
  const room = await roomApi.findById(roomId)
  if (!room) throw notFound()
  if (room.owner !== ownerId) throw i18nError('FORBIDDEN', 'host:errors.room.ownerOnly', 'Only the owner of the room can do this')
  return room
}

/** The rooms of the home page: the private rooms of the others are hidden */
export const findRoomsFor = async (viewerId: string | null | undefined): Promise<Room[]> => {
  const rooms = await roomApi.findMany()
  return rooms.filter(room => room.visibility !== 'private' || room.owner === viewerId).map(room => toRoom(room))
}

export const findRoomById = async (id: string): Promise<Room | undefined> => {
  const room = await roomApi.findById(id)
  return room && toRoom(room)
}

/**
 * The presence of one subscriber in a room. `refresh()` checks whether the user may (still) be in the room and joins or
 * leaves its presence accordingly. The check and the join happen in the same tick, so two users waiting for the last spot
 * cannot both take it. Throws NOT_FOUND when the room does not exist, and returns undefined when nothing changed for this
 * user since the last call (joining wakes up the listener of the subscriber itself: no need to send the same view twice).
 */
export const openRoomSession = (roomId: string, userId: string) => {
  let leave: (() => void) | undefined
  let lastView: string | undefined
  const close = () => {
    leave?.()
    leave = undefined
  }

  return {
    refresh: async (): Promise<RoomView | undefined> => {
      const room = await roomApi.findById(roomId)
      if (!room) {
        close()
        throw notFound()
      }
      const reason = lockReason(room, userId)
      if (reason) close()
      else leave ??= roomPresence.join(roomId, userId)

      const view: RoomView = reason ? { status: 'locked', reason, room: toLockedRoom(room) } : { status: 'joined', room: toRoom(room, userId) }
      const serialized = JSON.stringify(view)
      if (serialized === lastView) return undefined
      lastView = serialized
      return view
    },
    close
  }
}

/** Whether `userId` may use a board: they may enter its room (whatever the number of people in it) */
export const canAccessBoard = async (boardId: string, userId: string): Promise<boolean> => {
  const room = await roomApi.findByBoardId(boardId)
  return !!room && accessReason(room, userId) === null
}

export const createRoom = async (ownerId: string, settings: RoomSettings): Promise<Room | undefined> => {
  const userFound = users.findById(ownerId)
  if (!userFound) {
    return
  }
  const { title, visibility, maxParticipants } = settings
  const passwordHash = await hashIfProtected(settings)
  const room = await roomApi.create({ owner: userFound, title, visibility, maxParticipants, passwordHash })
  return toRoom(room, ownerId)
}

/**
 * Changes the settings of a room. Going protected admits the users already in the room; going private empties the list of
 * the admitted users (the others are kept out on their next refresh, without being banned).
 */
export const updateRoom = async (roomId: string, ownerId: string, settings: RoomSettings): Promise<void> => {
  const { title, visibility, maxParticipants } = settings
  // hashed first: what follows reads and writes the room without waiting in between
  const newHash = await hashIfProtected(settings)
  const room = await findOwnedRoom(roomId, ownerId)

  const passwordHash = visibility === 'protected' ? (newHash ?? room.passwordHash) : null
  if (visibility === 'protected' && !passwordHash)
    throw i18nError('BAD_REQUEST', 'host:errors.room.passwordRequired', 'A protected room needs a password')

  let members = room.members
  if (visibility === 'private') members = []
  if (visibility === 'protected' && room.visibility !== 'protected') {
    const present = roomPresence.list(roomId).filter(id => id !== room.owner)
    members = [...new Set([...members, ...present])]
  }

  await roomApi.update(roomId, { title, visibility, maxParticipants, passwordHash, members })
}

/** Admits a user to a protected room when the password is right */
export const joinRoom = async (roomId: string, userId: string, password: string): Promise<void> => {
  const room = await roomApi.findById(roomId)
  if (!room) throw notFound()
  const reason = accessReason(room, userId)
  if (reason === 'banned') throw i18nError('FORBIDDEN', 'host:errors.room.banned', 'The owner removed you from this room')
  if (reason === 'private') throw i18nError('FORBIDDEN', 'host:errors.room.private', 'This room is private')
  if (reason !== 'password') return

  const isRight = !!room.passwordHash && (await verifyPassword(password, room.passwordHash))
  if (!isRight) throw i18nError('FORBIDDEN', 'host:errors.room.wrongPassword', 'Wrong password')

  // read again: the room may have changed while the password was checked
  const fresh = await roomApi.findById(roomId)
  if (fresh) await roomApi.update(roomId, { members: [...new Set([...fresh.members, userId])] })
}

/** Kicks a user out of the room: banned until the owner lets them in again (and admitted no more) */
export const kickUser = async (roomId: string, ownerId: string, userId: string): Promise<void> => {
  const room = await findOwnedRoom(roomId, ownerId)
  if (userId === ownerId) throw i18nError('BAD_REQUEST', 'host:errors.room.cannotKickSelf', 'You cannot kick yourself out')

  await roomApi.update(roomId, {
    banned: [...new Set([...room.banned, userId])],
    members: room.members.filter(id => id !== userId)
  })
}

/** Lets a kicked user come back (with the password again, for a protected room) */
export const unbanUser = async (roomId: string, ownerId: string, userId: string): Promise<void> => {
  const room = await findOwnedRoom(roomId, ownerId)
  await roomApi.update(roomId, { banned: room.banned.filter(id => id !== userId) })
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
  return refreshedRoom ? toRoom(refreshedRoom, ownerId) : undefined
}

export const removeBoard = async (roomId: string, boardId: string, ownerId: string): Promise<Room | undefined | false> => {
  const room = await roomApi.findById(roomId)
  if (!room) return false
  if (room.owner !== ownerId) return false

  const refreshedRoom = await roomApi.removeBoard({ boardId, roomId })
  return refreshedRoom ? toRoom(refreshedRoom, ownerId) : undefined
}
