import React from 'react'
import './App.css'
import '@front/utils/trpc'
import { trpc } from '@front/utils/trpc'
import UseTrpc from '@front/hooks/useTrpc'
import Router from './Router'

const App = () => {
	const { trpcClient, queryClient, QueryClientProvider } = UseTrpc()

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<div className='App'>
					<Router />
				</div>
			</QueryClientProvider>
		</trpc.Provider>
	)
}

export default App
