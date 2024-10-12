import reactPaintApi, { type DBReactPaint } from '@back/modules/paint/paintApi'
import userApi from '@back/api/user'
import type { ReactPaint } from '@common/reactPaint'

const resolveUsers = async (paint?: DBReactPaint): Promise<ReactPaint | undefined> => {
  if (paint === undefined) return undefined

  const owner = (await userApi.findById(paint.owner))!
  return {
    ...paint,
    owner
  }
}

export const findMany = async (): Promise<ReactPaint[]> => {
  const paints = await reactPaintApi.findMany()
  const promises = paints.map(async session => (await resolveUsers(session))!)
  return Promise.all(promises)
}

export const findReactPaintById = async (id: string): Promise<ReactPaint | undefined> => {
  const paint = await reactPaintApi.findById(id)
  return resolveUsers(paint)
}

export const createReactPaint = async (owner: string, sessionId: string): Promise<ReactPaint | undefined> => {
  const userFound = await userApi.findById(owner)
  if (!userFound) {
    return
  }
  const paint = await reactPaintApi.create({ sessionId, owner })
  return resolveUsers(paint)
}

export const deleteReactPaint = async (reactPaintId: string, ownerId: string): Promise<boolean> => {
  const paint = await reactPaintApi.findById(reactPaintId)
  if (!paint) {
    return false
  }

  const userFound = await userApi.findById(ownerId)
  if (!userFound) {
    return false
  }

  if (paint.owner !== ownerId) return false

  await reactPaintApi.delete({ reactPaintId })
  return true
}

export const editReactPaint = async (reactPaintId: string, userId: string, newData: unknown): Promise<ReactPaint | false> => {
  const paint = await reactPaintApi.findById(reactPaintId)
  if (!paint) return false

  const userFound = await userApi.findById(userId)
  if (!userFound) return false

  const refreshedPaint = await reactPaintApi.edit({
    reactPaintId,
    newData
  })

  return (await resolveUsers(refreshedPaint!)) ?? false
}
