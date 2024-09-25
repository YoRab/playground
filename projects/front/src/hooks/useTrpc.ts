import { trpc } from '@front/utils/trpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client'
import React, { useState } from 'react'

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: 'ws://localhost:4001',
  connectionParams: async () => {
    return {
      token: localStorage.getItem('jwt_token') ?? ''
    }
  }
})

export const reconnectWsClient = () => {
  wsClient.close()
  wsClient.reconnect()
}

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
