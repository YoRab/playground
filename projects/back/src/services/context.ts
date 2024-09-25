import { decodeJwtToken } from '@back/utils/auth'
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'

// This is how you initialize a context for the server
export const createContext = async ({ req, info }: CreateHTTPContextOptions | CreateWSSContextFnOptions) => {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const user = await decodeJwtToken(req.headers.authorization.split(' ')[1])
      return user
    }
    if (info.connectionParams?.token) {
      const user = await decodeJwtToken(info.connectionParams?.token)
      return user
    }
    return null
  }

  const user = await getUserFromHeader()

  return {
    user
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
