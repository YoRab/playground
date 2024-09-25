import React, { useState } from 'react'
import './home.css'
import type { Session } from '@common/model'
import { trpc } from '@front/utils/trpc'

const Home = () => {
  const [games, setGames] = useState<Session[]>([])

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  trpc.public.onGetSessions.useSubscription(undefined, {
    onData(games) {
      console.log('received games', games)
      setGames(games)
    },
    onError(err) {
      console.error('Subscription error:', err)
    }
  })

  const addNewGameMutation = trpc.protected.addNewSession.useMutation({
    onSuccess: data => {
      console.log('game created', data)
      if (data) window.location.href = `#/board/${data.id}`
    }
  })

  const deleteGameMutation = trpc.protected.deleteSession.useMutation({
    onSuccess: data => {
      console.log('game deleted', data)
    }
  })

  const addNewGame = () => {
    addNewGameMutation.mutate()
  }

  const deleteGame = (boardId: string) => {
    deleteGameMutation.mutate({ game: boardId })
  }

  return (
    <section className='section'>
      <h1 className='title'>Sessions actives</h1>
      <button type='button' className='button' onClick={addNewGame}>
        Nouveau
      </button>
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
