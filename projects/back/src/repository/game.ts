import gameApi, { type DBSession } from '@back/api/game'
import userApi from '@back/api/user'
import type { Session } from '@common/model'

const resolveUsers = async (session?: DBSession): Promise<Session | undefined> => {
  if (session === undefined) return undefined

  const owner = await userApi.findById(session.owner)
  const watchers = (await Promise.all(session.watchers.map(async ([_socketId, userId]) => await userApi.findById(userId)))).filter(
    (user, index, array) => !!user && array.indexOf(user) === index
  ) as Session['watchers']

  return {
    ...session,
    owner,
    watchers
  }
}

export const findMany = async (): Promise<Session[]> => {
  const sessions = await gameApi.findMany()
  const promises = sessions.map(async session => (await resolveUsers(session))!)
  return Promise.all(promises)
}

export const findSessionById = async (id: string): Promise<Session | undefined> => {
  const session = await gameApi.findById(id)
  return resolveUsers(session)
}

export const createSession = async (owner: string): Promise<Session | undefined> => {
  const userFound = await userApi.findById(owner)
  if (!userFound) {
    return
  }
  const session = await gameApi.create({ owner })
  return resolveUsers(session)
}

export const deleteSession = async (sessionId: string, ownerId: string): Promise<boolean> => {
  const session = await gameApi.findById(sessionId)
  if (!session) {
    return false
  }

  const userFound = await userApi.findById(ownerId)
  if (!userFound) {
    return false
  }

  if (session.owner !== ownerId) return false

  await gameApi.delete({ sessionId })
  return true
}

export const addWatcher = async (sessionId: string, socketId: string, watcherId: string): Promise<Session | undefined> => {
  const session = await gameApi.findById(sessionId)
  if (!session) {
    return
  }

  const userFound = await userApi.findById(watcherId)
  if (!userFound) {
    return resolveUsers(session!)
  }
  const refreshedSession = await gameApi.addWatcher({
    socketId: socketId,
    userId: watcherId,
    session: sessionId
  })

  return resolveUsers(refreshedSession!)
}

export const removeWatcher = async (sessionId: string, socketId: string): Promise<Session | undefined> => {
  const session = await gameApi.findById(sessionId)
  if (!session) {
    return
  }

  const refreshedSession = await gameApi.removeWatcher({
    socketId,
    session: sessionId
  })
  return resolveUsers(refreshedSession!)
}

export const addBoard = async (sessionId: string, boardId: string, ownerId: string, type: string): Promise<Session | undefined | false> => {
  const session = await gameApi.findById(sessionId)
  if (!session) return false

  const userFound = await userApi.findById(ownerId)
  if (!userFound) return false

  if (session.owner !== ownerId) return false

  const refreshedSession = await gameApi.addBoard({
    type,
    boardId,
    sessionId
  })

  return resolveUsers(refreshedSession!)
}

export const removeBoard = async (sessionId: string, boardId: string, ownerId: string): Promise<Session | undefined | false> => {
  const session = await gameApi.findById(sessionId)
  if (!session) return false

  const userFound = await userApi.findById(ownerId)
  if (!userFound) return false

  if (session.owner !== ownerId) return false

  const refreshedSession = await gameApi.removeBoard({
    boardId,
    sessionId
  })
  return resolveUsers(refreshedSession!)
}
