import protectedRouter from '@back/router/protectedRouter'
import publicRouter from '@back/router/publicRouter'
import { router } from '@back/services/trpc'
import { chessRouter, ChessAIRouter } from '@back/modules/chess/chessRouter'
import paintRouter from '@back/modules/paint/paintRouter'
import wordRouter from '@back/modules/word/wordRouter'

const appRouter = router({
  public: publicRouter,
  protected: protectedRouter,
  chess: chessRouter,
  chessAI: ChessAIRouter,
  word: wordRouter,
  paint: paintRouter
})
type OmitRouter<Path extends string> = Omit<typeof appRouter, '_def'> & {
  _def: Omit<(typeof appRouter)['_def'], 'record'> & { record: Omit<(typeof appRouter)['_def']['record'], Path> }
}
// Omit chessAI causes it will not be used by main client
export type ClientRouter = OmitRouter<'chessAI'>

export default appRouter
