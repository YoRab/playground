import React from 'react'
import './Toolbar.css'
import { trpc } from '../utils/trpc'
import useLocalStorage from '../hooks/useLocalStorage'
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

	return (
		<nav className='navbar is-black' aria-label='main navigation'>
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
