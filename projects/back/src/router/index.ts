import protectedRouter from '@back/router/protectedRouter'
import publicRouter from '@back/router/publicRouter'
import { router } from '@back/services/trpc'

// Merge routers together
const appRouter = router({
  public: publicRouter,
  protected: protectedRouter
})

export default appRouter
