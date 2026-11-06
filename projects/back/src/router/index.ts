import { appRouters, externalRouters } from '@back/apps'
import protectedRouter from '@back/router/protectedRouter'
import publicRouter from '@back/router/publicRouter'
import { mergeRouters, router } from '@platform/server'

// what the client of the shell can call (and is typed against)
const clientRouter = router({
  public: publicRouter,
  protected: protectedRouter,
  ...appRouters
})

// what the server serves: the same, plus the procedures of the external clients (bots, agents…)
const appRouter = mergeRouters(clientRouter, router(externalRouters))

export type ClientRouter = typeof clientRouter

export default appRouter
