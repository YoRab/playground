import { router } from '@back/services/trpc'
import protectedRouter from '@back/router/protectedRouter'
import publicRouter from '@back/router/publicRouter'

// Merge routers together
const appRouter = router({
	public: publicRouter,
	protected: protectedRouter
})

export default appRouter
