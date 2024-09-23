import React, { useState } from 'react'
import './board.css'
import { trpc } from '@front/utils/trpc'
import { getPathParams } from '@front/utils/path'
import ChessBoard from '@front/components/chessboard/ChessBoard'
import { Session, User } from '@common/model'
import Loading from '@front/components/Loading'

const BoardInner = ({ user, session }: { user: User; session: Session }) => {
	const isOwner = user.id === session.owner?.id

	const addNewBoardMutation = trpc.protected.addBoard.useMutation({
		onSuccess: data => {
			console.log('board created', data)
		}
	})

	const deleteBoardMutation = trpc.protected.deleteBoard.useMutation({
		onSuccess: data => {
			console.log('board deleted', data)
		}
	})

	const launchChess = () => {
		addNewBoardMutation.mutate({
			type: 'chess',
			sessionId: session.id
		})
	}

	return (
		<div className='ScreenBoardInner'>
			{session.boards.length === 0 ? (
				isOwner ? (
					<div>
						<button type='button' className='button' onClick={launchChess}>
							Nouvelle partie d'échec
						</button>
					</div>
				) : (
					<div>En attende de {session.owner?.pseudo ?? ''}</div>
				)
			) : (
				session.boards.map(board => (board.type === 'chess' ? <ChessBoard key={board.id} user={user} session={session} gameId={board.id} /> : null))
			)}
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
