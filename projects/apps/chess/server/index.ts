import { type AppApi, defineServerApp, type ExternalParams } from '@platform/server'
import { PERMISSION_CHESS_IA } from './ai/permissions'
import { findOrCreateAI } from './ai/repo'
import { chessAIRouter } from './ai/router'
import * as chessRepo from './repo'
import { chessRouter } from './router'

const chess = defineServerApp({
  type: 'chess',
  create: ({ ownerId, roomId }) => chessRepo.createGame(ownerId, roomId),
  remove: ({ boardId, userId }) => chessRepo.deleteGame(boardId, userId),
  router: chessRouter,
  // the AI clients: identified by their name, they play through `chessAI.*`
  external: {
    namespace: 'chessAI',
    permission: PERMISSION_CHESS_IA,
    authenticate: ({ name }: ExternalParams) => (name ? findOrCreateAI(name) : null),
    router: chessAIRouter
  }
})

export default chess
export type ChessApi = AppApi<typeof chess>
