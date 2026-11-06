import Room from '@front/components/room/Room'
import { getPathRoute } from '@front/utils/path'
import { trpc } from '@front/utils/trpc'
import { AppShell, Flex } from '@mantine/core'
import { Loading } from '@platform/client'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import Home from './home/home'
import Login from './login/Login'
import Toolbar from './Toolbar'

const Layout = ({ Component }: { Component: () => React.JSX.Element }) => {
  return (
    <AppShell header={{ height: 60 }} padding='md'>
      <AppShell.Header>
        <Toolbar />
      </AppShell.Header>
      {/* flex column: the boards fill the remaining height (flex: 1, min-height: 0) */}
      <AppShell.Main display='flex' style={{ flexDirection: 'column' }}>
        <Component />
      </AppShell.Main>
    </AppShell>
  )
}

const PATHS = {
  room: {
    elements: <Layout Component={Room} />,
    private: true,
    public: false
  },
  home: {
    elements: <Layout Component={Home} />,
    private: true,
    public: false
  },
  login: {
    elements: <Layout Component={Login} />,
    private: false,
    public: true
  }
}

const Router = () => {
  const [path, setPath] = useState<string | null>(getPathRoute())
  const userQuery = trpc.public.getMe.useQuery()
  const isLoading = userQuery.isLoading
  const user = userQuery.data
  const isAuthed = !!user
  const needRedirection = !(getPathRoute() in PATHS) || !PATHS[getPathRoute() as keyof typeof PATHS]?.[isAuthed ? 'private' : 'public']

  const onRouteChanged = useCallback(() => {
    const defaultPath = isAuthed ? 'home' : 'login'

    if (!(getPathRoute() in PATHS) || !PATHS[getPathRoute() as keyof typeof PATHS]?.[isAuthed ? 'private' : 'public']) {
      window.history.replaceState(null, '', `#/${defaultPath}`)
      setPath(defaultPath)
      return
    }
    setPath(getPathRoute())
  }, [isAuthed])

  useEffect(() => {
    if (isLoading) return
    window.addEventListener('popstate', onRouteChanged)
    onRouteChanged()
    return () => {
      window.removeEventListener('popstate', onRouteChanged)
    }
  }, [isLoading, onRouteChanged])

  return isLoading ? (
    <Flex mih='100dvh' direction='column'>
      <Loading />
    </Flex>
  ) : (
    (!needRedirection && PATHS[path as keyof typeof PATHS]?.elements) || null
  )
}

export default Router
