import { getPathRoute } from '@front/utils/path'
import { trpc } from '@front/utils/trpc'
import React, { useCallback, useEffect, useState } from 'react'
import Loading from './Loading'
import Toolbar from './Toolbar'
import Home from './home/home'
import Login from './login/Login'
import '@yorab/react-paint/react-paint.css'
import Room from '@front/components/room/Room'
import Footer from './Footer'
import './Router.css'

const WithToolbar = ({
  Component,
  toolbar = false,
  footer = false,
  name
}: { Component: () => JSX.Element; toolbar?: boolean; footer?: boolean; name: string }) => {
  return (
    <>
      {toolbar && <Toolbar screen={name} />}
      <section className='main'>
        <Component />
      </section>
      {footer && <Footer />}
    </>
  )
}

const PATHS = {
  room: {
    elements: <WithToolbar toolbar Component={Room} name='Room' />,
    private: true,
    public: false
  },
  home: {
    elements: <WithToolbar toolbar Component={Home} name='Home' />,
    private: true,
    public: false
  },
  login: {
    elements: <WithToolbar toolbar Component={Login} name='Login' />,
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

  return isLoading ? <Loading /> : (!needRedirection && PATHS[path as keyof typeof PATHS]?.elements) || null
}

export default Router
