import Room from '@front/components/room/Room'
import { getPathRoute } from '@front/utils/path'
import { trpc } from '@front/utils/trpc'
import { AppShell, Flex } from '@mantine/core'
import { Loading } from '@platform/client'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Home from './home/home'
import Login from './login/Login'
import classes from './Router.module.css'
import Toolbar from './Toolbar'

const Layout = ({ Component }: { Component: () => React.JSX.Element }) => {
  return (
    <AppShell header={{ height: 60 }} padding='md'>
      <AppShell.Header>
        <Toolbar />
      </AppShell.Header>
      {/* flex column: the boards fill the remaining height (flex: 1, min-height: 0) */}
      <AppShell.Main className={classes.main}>
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

type PathName = keyof typeof PATHS

/** The route the visitor may open, if the hash names one that is allowed for their auth state */
const allowedRoute = (route: string, isAuthed: boolean) =>
  Object.hasOwn(PATHS, route) && PATHS[route as PathName][isAuthed ? 'private' : 'public'] ? (route as PathName) : null

const Router = () => {
  const [path, setPath] = useState<string | null>(getPathRoute())
  // the page asked before logging in (an invitation link): opened once logged in
  const returnTo = useRef<string | null>(null)
  const userQuery = trpc.public.getMe.useQuery()
  const isLoading = userQuery.isLoading
  const user = userQuery.data
  const isAuthed = !!user
  const route = allowedRoute(getPathRoute(), isAuthed)

  const onRouteChanged = useCallback(() => {
    const asked = getPathRoute()
    if (allowedRoute(asked, isAuthed)) {
      setPath(asked)
      return
    }
    if (!isAuthed && Object.hasOwn(PATHS, asked)) returnTo.current = window.location.hash
    const target = (isAuthed && returnTo.current) || `#/${isAuthed ? 'home' : 'login'}`
    if (isAuthed) returnTo.current = null
    window.history.replaceState(null, '', target)
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
    (route && PATHS[path as PathName]?.elements) || null
  )
}

export default Router
