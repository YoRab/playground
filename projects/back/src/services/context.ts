import { PERMISSION_CHESS_IA, PERMISSIONS } from '@back/constants/permissions'
import { createAI, findAIByPseudo } from '@back/modules/chess/AI/chessAIRepo'
import { decodeJwtToken } from '@back/utils/auth'
import type { User } from '@common/model'
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'

export const createContext = async ({
  req,
  info
}: CreateHTTPContextOptions | CreateWSSContextFnOptions): Promise<{
  permissions: string[] | null
  user: User | null
}> => {
  const getPermissionsFromHeader = async () => {
    const apiKey = req.headers['x-api-key'] ?? info.connectionParams?.apiKey

    if (!apiKey) return []
    const apiKeys = Array.isArray(apiKey) ? apiKey : [apiKey]

    return apiKeys.map(key => PERMISSIONS.get(key)).filter(key => key !== undefined)
  }

  const getUserFromHeader = async (permissions: string[] | null) => {
    if (permissions?.includes(PERMISSION_CHESS_IA)) {
      const name = info.connectionParams?.name

      if (name) {
        const ai = await findAIByPseudo(name)
        if (!ai) {
          return await createAI(name)
        }
        return ai
      }
    } else {
      const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : info.connectionParams?.token

      if (token) {
        const user = await decodeJwtToken(token)
        return user
      }
    }

    return null
  }

  const permissions = await getPermissionsFromHeader()
  const user = await getUserFromHeader(permissions)

  return {
    permissions,
    user
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
