import { findExternalClient } from '@back/apps'
import { API_KEYS } from '@back/constants/permissions'
import { canAccessBoard } from '@back/repository/room'
import { decodeJwtToken } from '@back/utils/auth'
import type { Context, CreateHTTPContextOptions, CreateWSSContextFnOptions } from '@platform/server'

export const createContext = async ({ req, info }: CreateHTTPContextOptions | CreateWSSContextFnOptions): Promise<Context> => {
  const getPermissionsFromHeader = async () => {
    const apiKey = req.headers['x-api-key'] ?? info.connectionParams?.apiKey

    if (!apiKey) return []
    const apiKeys = Array.isArray(apiKey) ? apiKey : [apiKey]

    return apiKeys.map(key => API_KEYS.get(key)).filter(key => key !== undefined)
  }

  const getUserFromHeader = async (permissions: string[]) => {
    // an API key identifies an external client of an app, which knows how to name it
    const externalClient = findExternalClient(permissions)
    if (externalClient) return await externalClient.authenticate(info.connectionParams ?? {})

    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : info.connectionParams?.token

    if (token) {
      return await decodeJwtToken(token)
    }

    return null
  }

  const permissions = await getPermissionsFromHeader()
  const user = await getUserFromHeader(permissions)

  return {
    permissions,
    user,
    canAccessBoard: boardId => !!user && canAccessBoard(boardId, user.id)
  }
}
