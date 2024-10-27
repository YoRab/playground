import React, { useState } from 'react'
import './home.css'
import type { Room } from '@common/model'
import { trpc } from '@front/utils/trpc'

const Home = () => {
  const [rooms, setRooms] = useState<Room[]>([])

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  trpc.public.onGetRooms.useSubscription(undefined, {
    onData(games) {
      console.log('received rooms', games)
      setRooms(games)
    },
    onError(err) {
      console.error('Subscription error:', err)
    }
  })

  const addNewGameMutation = trpc.protected.addNewRoom.useMutation({
    onSuccess: data => {
      console.log('room created', data)
      if (data) window.location.href = `#/room/${data.id}`
    }
  })

  const deleteRoomMutation = trpc.protected.deleteRoom.useMutation({
    onSuccess: data => {
      console.log('room deleted', data)
    }
  })

  const addNewRoom = () => {
    addNewGameMutation.mutate()
  }

  const deleteRoom = (room: string) => {
    deleteRoomMutation.mutate({ room })
  }

  return (
    <section className='section Home'>
      <h1 className='title'>
        Active rooms
        <button type='button' className='button is-primary' onClick={addNewRoom}>
          New
        </button>
      </h1>
      <div className='grid'>
        {rooms?.map(room => {
          return (
            <div key={room.id} className='card cell '>
              <header className='card-header'>
                <p className='card-header-title'>{room.title}</p>
              </header>
              <div className='card-content'>
                <div>
                  Created on {new Date(room.createdAt).toUTCString()} by {room.owner?.pseudo ?? 'Unknown (çà pue le bug)'}
                </div>
                <div>
                  <strong>
                    {room.watchers.length} in the room : {room.watchers.map(watcher => watcher.pseudo).join(', ')}
                  </strong>
                </div>
              </div>
              <footer className='card-footer'>
                <div className='card-footer-item'>
                  {room.owner?.id === user?.id && (
                    <button type='button' className='button is-danger' onClick={() => deleteRoom(room.id)}>
                      Delete
                    </button>
                  )}
                  <span className='Flex1' />
                  <a type='button' className='button' href={`#/room/${room.id}`}>
                    Join
                  </a>
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
