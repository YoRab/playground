import React, { useState } from 'react'
import './Room.css'
import type { Room, User } from '@common/model'
import Loading from '@front/components/Loading'
import ChessBoard from '@front/components/chessboard/ChessBoard'
import Paint from '@front/components/paint/paint'
import Word from '@front/components/word/word'
import { getPathParams } from '@front/utils/path'
import { trpc } from '@front/utils/trpc'
import { PIECES_PIC } from '@front/constants/pieces'

const RoomInner = ({ user, room }: { user: User; room: Room }) => {
  const [showNewGame, setShowNewGame] = useState(false)
  const isOwner = user.id === room.owner?.id
  const [activeTabIndex, setActiveTabIndex] = useState(room.boards.length)

  const activeBoard = activeTabIndex > 0 ? room.boards[activeTabIndex - 1] : undefined
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
      roomId: room.id
    })
  }

  const deleteBoard = (boardId: string) => {
    deleteBoardMutation.mutate({
      roomId: room.id,
      boardId
    })
  }
  return (
    <div className='ScreenBoardInner'>
      {/* <div className='tabs is-large'>
        <ul>
          <li className={activeTabIndex === 0 ? 'is-active' : undefined}>
            <a onClick={() => setActiveTabIndex(0)}>Accueil</a>
          </li>
          {room.boards.map((board, index) => {
            return (
              <li key={board.id} className={activeTabIndex === index + 1 ? 'is-active' : undefined}>
                <a onClick={() => setActiveTabIndex(index + 1)}>{board.type}</a>
              </li>
            )
          })}
        </ul>
      </div> */}
      {activeBoard && isOwner && (
        <div className='BoardDelete'>
          <button type='button' className='button is-danger' onClick={() => deleteBoard(activeBoard.id)}>
            Delete board
          </button>
        </div>
      )}

      {!activeBoard ? (
        isOwner ? (
          <div className='CenteredBoard'>
            <button type='button' className='button' onClick={() => setShowNewGame(true)}>
              New board
            </button>
          </div>
        ) : (
          <div className='CenteredBoard'>Waiting for {room.owner?.pseudo ?? ''}</div>
        )
      ) : activeBoard.type === 'chess' ? (
        <ChessBoard user={user} room={room} boardId={activeBoard.id} />
      ) : activeBoard.type === 'reactPaint' ? (
        <Paint user={user} room={room} boardId={activeBoard.id} />
      ) : activeBoard.type === 'word' ? (
        <Word user={user} room={room} boardId={activeBoard.id} />
      ) : null}

      <div className={`modal ${showNewGame ? ' is-active' : ''}`}>
        <div className='modal-background' onClick={() => setShowNewGame(false)} />
        <div className='modal-card'>
          <header className='modal-card-head'>
            <p className='modal-card-title'>Create a new board</p>
            <button type='button' className='delete' aria-label='close' onClick={() => setShowNewGame(false)} />
          </header>
          <section className='modal-card-body chooseBoardContent'>
            <div className='chooseBoardButton' onClick={() => newBoard('chess')}>
              <img className='Piece isoverlay' alt='' src={PIECES_PIC.get('wpawn')} />
              <div>Chess board</div>
            </div>
            <div className='chooseBoardButton' onClick={() => newBoard('reactPaint')}>
              Paint (incoming)
            </div>
            <div className='chooseBoardButton' onClick={() => newBoard('word')}>
              Word (incoming)
            </div>
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

const RoomComponent = () => {
  const [room, setRoom] = useState<Room>()
  const [error, setError] = useState<string | undefined>()

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  const [roomId] = getPathParams()

  trpc.protected.watchRoom.useSubscription(
    { roomId },
    {
      onData(data) {
        console.log('received dataaaa !')
        setRoom(data)
      },
      onError(err) {
        console.error('Subscription error:', err)
        setError(err.message)
      }
    }
  )

  return (
    <div className='ScreenBoard'>
      <h1 className='is-size-4'>
        <a className='button' href='#/home'>
          Back to Home
        </a>
        &nbsp;
        {room?.title}
      </h1>
      {error ?? (room ? <RoomInner user={user!} room={room} /> : <Loading />)}
    </div>
  )
}

export default RoomComponent
