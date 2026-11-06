import { trpc } from '@front/utils/trpc'
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@platform/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// same host as the page by default, so that the app also works from another device of the network (`vite --host`)
const API_URL = import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:4001`
const WS_URL = import.meta.env.VITE_WS_URL ?? API_URL.replace(/^http/, 'ws')

// lazy WebSocket connection: opened on first subscription, with the token read at that time
const wsClient = createWSClient({
  url: WS_URL,
  lazy: { enabled: true, closeMs: 0 },
  connectionParams: async () => {
    return {
      token: localStorage.getItem('jwt_token') ?? ''
    }
  }
})

// close the connection so the next subscription reconnects with the fresh token
export const resetWsClient = () => wsClient.close()

const UseTrpc = () => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            return op.type === 'subscription'
          },
          true: wsLink({
            client: wsClient
          }),
          false: httpBatchLink({
            url: API_URL,
            async headers() {
              return {
                authorization: `Bearer ${localStorage.getItem('jwt_token') ?? ''}`
              }
            }
          })
        })
      ]
    })
  )

  return { trpcClient, queryClient, QueryClientProvider }
}

export default UseTrpc
