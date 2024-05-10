import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@front/utils/trpc'
import { createWSClient, splitLink, httpBatchLink, wsLink } from '@trpc/client'

// create persistent WebSocket connection
const wsClient = createWSClient({
	url: 'ws://localhost:4001'
})

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
