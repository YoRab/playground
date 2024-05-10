import React, { useState } from 'react'
import './board.css'
import { trpc } from '@front/utils/trpc'
import { getPathParams } from '@front/utils/path'
import ChessBoard from '@front/components/chessboard/ChessBoard'
import { Game } from '@common/model'
import Loading from '@front/components/Loading'

const Board = () => {
	const [game, setGame] = useState<Game>()
	const [error, setError] = useState<string | undefined>()

	const userQuery = trpc.public.getMe.useQuery()
	const user = userQuery.data

	const [gameId] = getPathParams()

	trpc.public.watchGame.useSubscription(
		{ gameId: gameId, userId: user?.id },
		{
			onData(data) {
				console.log('received dataaaa !')
				setGame(data)
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
			{error ?? (game ? <ChessBoard /> : <Loading />)}
		</div>
	)
}

export default Board
