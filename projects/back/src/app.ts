import { createContext } from '@back/services/context'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import cors from 'cors'
import ws from 'ws'
import appRouter, { type ClientRouter } from './router'

const port = +(process.env.PORT || 4001)

// Export type router type signature,
// NOT the router itself.
export type AppRouter = ClientRouter

const httpServer = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext
})

const wss = new ws.Server({
  server: httpServer
})

const handler = applyWSSHandler({ wss, router: appRouter, createContext })
wss.on('connection', ws => {
  console.log(`new connection (${wss.clients.size})`)
  ws.once('close', () => {
    console.log(`closed connection (${wss.clients.size})`)
  })
})

process.on('SIGTERM', () => {
  console.log('SIGTERM')
  handler.broadcastReconnectNotification()
  wss.close()
})

httpServer.listen(port)
console.log(`✅ Http & Ws Server listening on http://localhost:${port}`)
