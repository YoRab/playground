import { type AppProps, ErrorAlert, Loading } from '@platform/client'
import { decodeView } from '@yorab/mine.io/engine'
import { BoardStoreProvider, createBoardStore } from '@yorab/mine.io/react'
import { useRef, useState } from 'react'
import type { Lobby } from '../server/types'
import { GameView } from './Game'
import { LobbyView } from './Lobby'
import { trpc } from './trpc'

const MineIo = ({ user, boardId }: AppProps) => {
  const [store] = useState(createBoardStore)
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [error, setError] = useState<string | null>(null)
  // a new attempt subscribes again, to start over from a snapshot
  const [attempt, setAttempt] = useState(0)
  const lastSeq = useRef(-1)

  trpc.mineio.sync.useSubscription(
    { boardId, attempt },
    {
      onData: message => {
        const board = store.getState()
        switch (message.type) {
          case 'hover':
            board.setHover(message.seat, message.cell)
            break
          case 'snapshot': {
            lastSeq.current = message.seq
            const seat = message.lobby.seats.findIndex(entry => entry?.kind === 'human' && entry.userId === user.id)
            if (message.view) board.load(decodeView(message.view), seat >= 0 ? seat : null)
            else board.reset()
            message.hovers.forEach((cell, index) => {
              board.setHover(index, cell)
            })
            setLobby(message.lobby)
            setError(null)
            break
          }
          case 'events':
            if (message.seq <= lastSeq.current) break
            if (message.seq !== lastSeq.current + 1) {
              // a message was missed: the board is no longer reliable
              setAttempt(count => count + 1)
              break
            }
            lastSeq.current = message.seq
            board.applyEvents(message.events)
            break
        }
      },
      onError: err => setError(err.message)
    }
  )

  if (error) return <ErrorAlert title='Board unavailable'>{error}</ErrorAlert>
  if (!lobby) return <Loading />

  return (
    <BoardStoreProvider store={store}>
      {lobby.playing ? <GameView boardId={boardId} lobby={lobby} user={user} /> : <LobbyView boardId={boardId} lobby={lobby} user={user} />}
    </BoardStoreProvider>
  )
}

export default MineIo
