import React, { useState } from 'react'
import './board.css'
import { trpc } from '@front/utils/trpc'
import { getPathParams } from '@front/utils/path'
import ChessBoard from '@front/components/chessboard/ChessBoard'
import { Session, User } from '@common/model'
import Loading from '@front/components/Loading'
import Paint from '@front/components/reactPaint/paint'
import Word from '@front/components/word/word'

const BoardInner = ({ user, session }: { user: User; session: Session }) => {
	const [showNewGame, setShowNewGame] = useState(false)
	const isOwner = user.id === session.owner?.id
	const [activeTabIndex, setActiveTabIndex] = useState(0)

	const activeBoard = activeTabIndex > 0 ? session.boards[activeTabIndex - 1] : undefined
	const addNewBoardMutation = trpc.protected.addBoard.useMutation({
		onSuccess: data => {
			console.log('board created', data)
			if (data) {
				setActiveTabIndex(data.boards.length)
			}
		}
	})

	const deleteBoardMutation = trpc.protected.deleteBoard.useMutation({
		onSuccess: data => {
			console.log('board deleted', data)
		}
	})

	const newBoard = (type: 'chess' | 'reactPaint' | 'word') => {
		setShowNewGame(false)
		addNewBoardMutation.mutate({
			type,
			sessionId: session.id
		})
	}

	const deleteBoard = (boardId: string) => {
		deleteBoardMutation.mutate({
			sessionId: session.id,
			boardId
		})
	}
	return (
		<div className='ScreenBoardInner'>
			<div className='tabs is-large'>
				<ul>
					<li className={activeTabIndex === 0 ? 'is-active' : undefined}>
						<a onClick={() => setActiveTabIndex(0)}>Accueil</a>
					</li>
					{session.boards.map((board, index) => {
						return (
							<li key={board.id} className={activeTabIndex === index + 1 ? 'is-active' : undefined}>
								<a onClick={() => setActiveTabIndex(index + 1)}>{board.type}</a>
							</li>
						)
					})}
				</ul>
			</div>
			{activeBoard && (
				<div>
					<button type='button' className='button is-danger' onClick={() => deleteBoard(activeBoard.id)}>
						Delete board
					</button>
				</div>
			)}

			{!activeBoard ? (
				isOwner ? (
					<div>
						<button type='button' className='button' onClick={() => setShowNewGame(true)}>
							Nouveau board
						</button>
					</div>
				) : (
					<div>En attende de {session.owner?.pseudo ?? ''}</div>
				)
			) : activeBoard.type === 'chess' ? (
				<ChessBoard user={user} session={session} boardId={activeBoard.id} />
			) : activeBoard.type === 'reactPaint' ? (
				<Paint user={user} session={session} boardId={activeBoard.id} />
			) : activeBoard.type === 'word' ? (
				<Word user={user} session={session} boardId={activeBoard.id} />
			) : null}

			<div className={`modal ${showNewGame ? ' is-active' : ''}`}>
				<div className='modal-background' onClick={() => setShowNewGame(false)} />
				<div className='modal-card'>
					<header className='modal-card-head'>
						<p className='modal-card-title'>Créer une nouveau board</p>
						<button type='button' className='delete' aria-label='close' onClick={() => setShowNewGame(false)} />
					</header>
					<section className='modal-card-body'>
						<button type='button' className='button is-success' onClick={() => newBoard('chess')}>
							Chess board
						</button>
						<button type='button' className='button is-success' onClick={() => newBoard('reactPaint')}>
							reactPaint board
						</button>
						<button type='button' className='button is-success' onClick={() => newBoard('word')}>
							Word board
						</button>
					</section>
					<footer className='modal-card-foot'>
						<div className='buttons'>
							<button type='button' className='button' onClick={() => setShowNewGame(false)}>
								Cancel
							</button>
						</div>
					</footer>
				</div>
			</div>
		</div>
	)
}

const Board = () => {
	const [session, setSession] = useState<Session>()
	const [error, setError] = useState<string | undefined>()

	const userQuery = trpc.public.getMe.useQuery()
	const user = userQuery.data

	const [sessionId] = getPathParams()

	trpc.protected.watchSession.useSubscription(
		{ sessionId },
		{
			onData(data) {
				console.log('received dataaaa !')
				setSession(data)
			},
			onError(err) {
				console.error('Subscription error:', err)
				setError(err.message)
			}
		}
	)

	return (
		<div className='ScreenBoard'>
			<a className='button' href='#/home'>
				Retour
			</a>
			{error ?? (session ? <BoardInner user={user!} session={session} /> : <Loading />)}
		</div>
	)
}

export default Board
