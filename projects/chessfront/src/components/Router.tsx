import React, { useCallback, useEffect, useState } from 'react'
import Toolbar from './Toolbar'
import Home from './home/home'
import Login from './login/Login'
import { trpc } from '../utils/trpc'
import Loading from './Loading'
import { getPathRoute } from '../utils/path'
import Board from './board/board'
import Word from './word/word'
import Paint from './reactPaint/paint'
import '@yorab/react-paint/react-paint.css'
import Footer from './Footer'

const WithToolbar = ({ Component, name }: { Component: () => JSX.Element; name: string }) => {
	return (
		<>
			<Toolbar screen={name} />
			<Component />
			<Footer />
		</>
	)
}

const PATHS = {
	board: {
		elements: <WithToolbar Component={Board} name='Board' />,
		private: true,
		public: false
	},
	home: {
		elements: <WithToolbar Component={Home} name='Home' />,
		private: true,
		public: false
	},
	login: {
		elements: <WithToolbar Component={Login} name='Login' />,
		private: false,
		public: true
	},
	word: {
		elements: <WithToolbar Component={Word} name='Word' />,
		private: true,
		public: false
	},
	paint: {
		elements: <WithToolbar Component={Paint} name='Paint' />,
		private: true,
		public: false
	}
}

const Router = () => {
	const [path, setPath] = useState<string | null>(getPathRoute())
	const userQuery = trpc.public.getMe.useQuery()
	const isLoading = userQuery.isLoading
	const user = userQuery.data
	const isAuthed = !!user
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

	return isLoading ? <Loading /> : PATHS[path as keyof typeof PATHS]?.elements ?? null
}

export default Router
