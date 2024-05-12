import React, { useState } from 'react'
import Cell from './Cell'
import './ChessBoard.css'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import Piece from './Piece'
import { getDroppableCells } from '@front/utils'
import { trpc } from '@front/utils/trpc'
import { Session, User } from '@common/model'
import { ChessGame, PieceType } from '@common/chess'
import Loading from '@front/components/Loading'

const ChessBoard = ({ user, session, gameId }: { user: User; session: Session; gameId: string }) => {
	const [boardData, setBoardData] = useState<ChessGame>()
	const [dragDatas, setDragDatas] = useState<{
		active: PieceType | undefined
		enabledCells: [number, number][]
	}>({
		active: undefined,
		enabledCells: []
	})

	trpc.public.watchChessGame.useSubscription(
		{ gameId },
		{
			onData(data) {
				console.log('received dataaaa !', data)
				data && setBoardData(data)
			},
			onError(err) {
				console.error('Subscription error:', err)
			}
		}
	)

	const movePieceMutation = trpc.protected.movePiece.useMutation({
		onSuccess: data => {
			console.log('piece moved', data)
		}
	})

	const addPlayerMutation = trpc.protected.addPlayer.useMutation({
		onSuccess: data => {
			console.log('addPlayer', data)
		}
	})

	const handleBoardClick = () => {
		setDragDatas({
			active: undefined,
			enabledCells: []
		})
	}

	const handleDragStart = (event: DragStartEvent) => {
		const active = boardData?.pieces.find(piece => piece.id === event.active.id)
		if (!active || !boardData) return
		setDragDatas({
			active,
			enabledCells: getDroppableCells({ boardData, active })
		})
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { over } = event
		const currentActive = dragDatas.active
		if (!currentActive || !over) return

		setDragDatas({
			active: undefined,
			enabledCells: []
		})
		movePieceMutation.mutate({ gameId, pieceId: currentActive.id, newPosition: (over.data.current as any).position })
	}

	const handleDropOnCell = (row: number, col: number) => {
		const currentActive = dragDatas.active
		if (!currentActive) return
		const newPosition = [row, col] as [number, number]

		setDragDatas({
			active: undefined,
			enabledCells: []
		})
		movePieceMutation.mutate({ gameId, pieceId: currentActive.id, newPosition })
	}

	const onJoinGame = (color: 'white' | 'black') => {
		addPlayerMutation.mutate({ gameId, color })
	}

	const userColor = boardData?.players.white?.id === user.id ? 'white' : boardData?.players.black?.id === user.id ? 'black' : undefined

	const needPlayer = boardData?.players.white === undefined || boardData?.players.black === undefined

	if (!boardData) return <Loading />
	return (
		<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className='ChessBoard'>
				<div
					className={`ChessBoardContainer${dragDatas.active ? ' isdragging' : ''}${userColor === 'black' ? ' isBlack' : ''}`}
					onClick={handleBoardClick}
				>
					<div className='Board'>
						{boardData.board.map((boardRow, rowIndex) => (
							<div key={rowIndex} className='Row'>
								{boardRow.map((boardCell, colIndex) => {
									const id = `${rowIndex}-${colIndex}`
									const piece = boardCell && !needPlayer ? boardData.pieces.find(piece => piece.id === boardCell) : undefined
									const dropEnabled = !!dragDatas.enabledCells.find(cell => cell[0] === rowIndex && cell[1] === colIndex)
									const isSelected = !!(dragDatas.active && dragDatas.active?.id === piece?.id)
									return (
										<Cell
											key={id}
											id={id}
											col={colIndex}
											row={rowIndex}
											piece={piece}
											dropEnabled={dropEnabled}
											isSelected={isSelected}
											handleDropOnCell={handleDropOnCell}
											playerTurn={boardData.playerTurn}
											userColor={userColor}
										/>
									)
								})}
							</div>
						))}

						{needPlayer &&
							(userColor ? (
								<div className='ChoicePlayers'>En attente d'un joueur</div>
							) : (
								<div className='ChoicePlayers'>
									<button className='button' type='button' onClick={() => onJoinGame('white')} disabled={!!boardData.players.white}>
										Jouer les blancs
									</button>
									<button className='button' type='button' onClick={() => onJoinGame('black')} disabled={!!boardData.players.black}>
										Jouer les noirs
									</button>
								</div>
							))}
					</div>
				</div>
				<div className='LostPieces'>
					{boardData.pieces
						.filter(piece => piece.position === null)
						.map(piece => {
							return <Piece key={piece.id} piece={piece} />
						})}
				</div>
				<DragOverlay className='DragOverlay'>{dragDatas.active && <Piece piece={dragDatas.active} isOverlay={true} />}</DragOverlay>
			</div>
		</DndContext>
	)
}

export default ChessBoard
