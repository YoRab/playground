import React from 'react'
import './App.css'
import '../utils/trpc'
import { trpc } from '../utils/trpc';
import UseTrpc from '../hooks/useTrpc';
import Router from './Router';

const App = () => {

  const { trpcClient, queryClient, QueryClientProvider } = UseTrpc()

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <Router />
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default App
