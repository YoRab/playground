import React, { useState } from 'react'
import './Toolbar.css'
import useLocalStorage from '@front/hooks/useLocalStorage'
import { trpc } from '@front/utils/trpc'
import { useQueryClient } from '@tanstack/react-query'

const Toolbar = ({ screen = '' }) => {
  const { setItem } = useLocalStorage()
  const queryClient = useQueryClient()

  const userQuery = trpc.public.getMe.useQuery(undefined)
  const user = userQuery.data

  const logoutMutation = trpc.protected.logout.useMutation({
    onSuccess: () => {
      setItem('jwt_token', null)
      queryClient.invalidateQueries()
    }
  })

  const logout = () => {
    logoutMutation.mutate()
  }

  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme'))

  const setTheme = (theme: string) => {
    if (theme) localStorage.setItem('theme', theme)
    else localStorage.removeItem('theme')
    document.querySelector('html')!.className = theme
    setCurrentTheme(theme)
  }

  return (
    <nav className='navbar' aria-label='main navigation'>
      <div className='navbar-brand'>
        <a className='navbar-item' href='/'>
          <img src='./vite.svg' alt='logo' />
          <span>YRP</span>
        </a>
      </div>
      <div className='navbar-menu'>
        <div className='navbar-start'>
          {user ? (
            <>
              <a className={`navbar-item is-tab${screen === 'Home' ? ' is-active' : ''}`} href='/#/home'>
                Home
              </a>
            </>
          ) : null}
        </div>
      </div>

      <div className='navbar-end'>
        {user ? (
          <>
            <div className='navbar-item'>
              <span>Hello {user?.pseudo}</span>
            </div>
            <div className='navbar-item'>
              <div className='buttons'>
                {/* <select onChange={e => setTheme(e.target.value)}> */}
                <div className='dropdown is-right is-hoverable'>
                  <div className='dropdown-trigger'>
                    <button type='button' className='button' aria-haspopup='true' aria-controls='dropdown-menu2'>
                      <span>{currentTheme === 'theme-light' ? 'clair' : currentTheme === 'theme-dark' ? 'sombre' : 'système'}</span>
                    </button>
                  </div>

                  <div className='dropdown-menu' id='dropdown-menu2'>
                    <div className='dropdown-content'>
                      <a
                        href='#'
                        className={`dropdown-item${currentTheme === 'theme-light' ? ' is-active' : ''}`}
                        onClick={() => {
                          setTheme('theme-light')
                        }}
                      >
                        <p>Thème clair</p>
                      </a>
                      <a
                        href='#'
                        className={`dropdown-item${currentTheme === 'theme-dark' ? ' is-active' : ''}`}
                        onClick={() => {
                          setTheme('theme-dark')
                        }}
                      >
                        <p>Thème sombre</p>
                      </a>
                      <a
                        href='#'
                        className={`dropdown-item${!currentTheme ? ' is-active' : ''}`}
                        onClick={() => {
                          setTheme('')
                        }}
                      >
                        <p>Thème du système</p>
                      </a>
                    </div>
                  </div>
                </div>
                <button type='button' className='button' onClick={logout}>
                  Déconnexion
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </nav>
  )
}

export default Toolbar
