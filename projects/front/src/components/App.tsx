import '@front/utils/trpc'
import UseTrpc from '@front/hooks/useTrpc'
import { theme } from '@front/theme'
import { trpc } from '@front/utils/trpc'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import Router from './Router'

const App = () => {
  const { trpcClient, queryClient, QueryClientProvider } = UseTrpc()

  return (
    <MantineProvider theme={theme} defaultColorScheme='auto'>
      <ModalsProvider>
        <Notifications />
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Router />
          </QueryClientProvider>
        </trpc.Provider>
      </ModalsProvider>
    </MantineProvider>
  )
}

export default App
