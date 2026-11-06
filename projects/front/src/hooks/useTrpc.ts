import { trpc } from '@front/utils/trpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client'
import { useState } from 'react'

// lazy WebSocket connection: opened on first subscription, with the token read at that time
const wsClient = createWSClient({
  url: 'ws://localhost:4001',
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
            url: 'http://localhost:4001',
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
