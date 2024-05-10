import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import { decodeJwtToken } from '@back/utils/auth'

// This is how you initialize a context for the server
export const createContext = async ({ req, res }: CreateHTTPContextOptions | CreateWSSContextFnOptions) => {
	async function getUserFromHeader() {
		if (req.headers.authorization) {
			const user = await decodeJwtToken(req.headers.authorization.split(' ')[1])
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
