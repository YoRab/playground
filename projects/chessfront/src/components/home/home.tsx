import React, { useState } from 'react'
import './home.css'
import { trpc } from '../../utils/trpc'
import type { Game } from 'chesscommon/src/model'

const Home = () => {
	const [showNewGame, setShowNewGame] = useState(false)
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
		<section className='section'>
			<h1 className='title'>Sessions actives</h1>
			<button type='button' className='button' onClick={() => setShowNewGame(true)}>
				Nouveau
			</button>
			<div className={`modal ${showNewGame ? ' is-active' : ''}`}>
				<div className='modal-background' onClick={() => setShowNewGame(false)} />
				<div className='modal-card'>
					<header className='modal-card-head'>
						<p className='modal-card-title'>Créer une nouvelle session</p>
						<button type='button' className='delete' aria-label='close' onClick={() => setShowNewGame(false)} />
					</header>
					<section className='modal-card-body'>
						<div className='card' onClick={addNewGame}>
							Chess
						</div>
					</section>
					<footer className='modal-card-foot'>
						<div className='buttons'>
							<button type='button' className='button is-success'>
								Save changes
							</button>
							<button type='button' className='button' onClick={() => setShowNewGame(false)}>
								Cancel
							</button>
						</div>
					</footer>
				</div>
			</div>

			<div>
				{games?.map(game => {
					return (
						<div key={game.id} className='card'>
							<header className='card-header'>
								<p className='card-header-title'>Session de chess</p>
							</header>
							<div className='card-content'>
								<div>
									<span>Session de {game.owner?.pseudo ?? 'Inconnu (çà pue le bug)'}</span>
									<span>Créé le {new Date(game.createdAt).toString()}</span>
								</div>
								<div>Participants : {game.players.length ? game.players.map(player => player.pseudo).join(', ') : 'Aucun'}</div>
							</div>
							<footer className='card-footer'>
								<div className='card-footer-item'>{game.watchers.length} observateurs</div>
								<div className='card-footer-item'>
									<a type='button' className='button' href={`#/board/${game.id}`}>
										Consulter
									</a>
									{game.owner?.id === user?.id && (
										<button type='button' className='button is-danger' onClick={() => deleteGame(game.id)}>
											Supprimer
										</button>
									)}
								</div>
							</footer>
						</div>
					)
				})}
			</div>
		</section>
	)
}

export default Home
