import React, { useState } from 'react'
import './home.css'
import { trpc } from '../../utils/trpc'
import type { Game } from 'chesscommon/src/model'

const Home = () => {
	const [games, setGames] = useState<Game[]>([])

	const userQuery = trpc.public.getMe.useQuery()
	const user = userQuery.data

	trpc.public.onGetGames.useSubscription(undefined, {
		onData(games) {
			console.log('received games', games)
			setGames(games)
		},
		onError(err) {
			console.error('Subscription error:', err)
		}
	})

	const addNewGameMutation = trpc.protected.addNewGame.useMutation({
		onSuccess: data => {
			console.log('game created', data)
		}
	})

	const deleteGameMutation = trpc.protected.deleteGame.useMutation({
		onSuccess: data => {
			console.log('game deleted', data)
		}
	})

	const addNewGame = () => {
		addNewGameMutation.mutate({})
	}

	const deleteGame = (gameId: string) => {
		deleteGameMutation.mutate({ game: gameId })
	}

	return (
		<div className='Home'>
			<div className='Title'>
				<h2>Sessions actives</h2>
				<button type='button' onClick={addNewGame}>
					Nouveau
				</button>
			</div>
			<div className='Games'>
				{games?.map(game => {
					return (
						<div key={game.id} className='Game'>
							<div>
								<span>Session de {game.owner?.pseudo ?? 'Inconnu (çà pue le bug)'}</span>
								<span>Créé le {new Date(game.createdAt).toString()}</span>
							</div>
							<div>Participants : {game.players.length ? game.players.map(player => player.pseudo).join(', ') : 'Aucun'}</div>
							<div>{game.watchers.length} observateurs</div>
							<div>
								<a type='button' href={`#/board/${game.id}`}>
									Consulter
								</a>
								{game.owner?.id === user?.id && (
									<button type='button' onClick={() => deleteGame(game.id)}>
										Supprimer
									</button>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default Home
