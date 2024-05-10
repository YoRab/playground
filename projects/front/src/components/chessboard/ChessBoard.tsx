import React, { useEffect, useState } from 'react'
import Cell from './Cell'
import './ChessBoard.css'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { PIECES, PieceType } from '@front/constants/pieces'
import Piece from './Piece'
import { getDroppableCells, getInitBoard } from '@front/utils'
import { moveCell } from '@front/utils/array'

let PLAYER: 0 | 1 = 0

const ChessBoard = () => {
	const [boardData, setBoardData] = useState<{
		board: (string | null)[][]
		pieces: PieceType[]
	}>({
		board: getInitBoard(),
		pieces: PIECES
	})

	const [dragDatas, setDragDatas] = useState<{
		active: PieceType | undefined
		enabledCells: [number, number][]
	}>({
		active: undefined,
		enabledCells: []
	})

	const handleBoardClick = () => {
		setDragDatas({
			active: undefined,
			enabledCells: []
		})
	}

	const handleDragStart = (event: DragStartEvent) => {
		const active = boardData.pieces.find(piece => piece.id === event.active.id)
		if (!active) return
		setDragDatas({
			active,
			enabledCells: getDroppableCells({ boardData, active })
		})
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { over } = event
		const currentActive = dragDatas.active
		if (!currentActive || !over) return
		PLAYER = ((PLAYER + 1) % 2) as 0 | 1
		setDragDatas({
			active: undefined,
			enabledCells: []
		})
		setBoardData(boardData => ({
			board: moveCell({
				board: boardData.board,
				row: (over.data.current as any).position[0],
				col: (over.data.current as any).position[1],
				currentActive
			}),
			pieces: boardData.pieces.map(piece => {
				const move = (over.data.current as any).position as [number, number]
				if (piece.id === currentActive.id) {
					return { ...piece, position: move }
				}
				if (piece.position?.[0] === move[0] && piece.position?.[1] === move[1]) {
					return { ...piece, position: null }
				}
				return piece
			})
		}))
	}

	const handleDropOnCell = (row: number, col: number) => {
		const currentActive = dragDatas.active
		if (!currentActive) return
		PLAYER = ((PLAYER + 1) % 2) as 0 | 1

		setBoardData(boardData => {
			return {
				board: moveCell({ board: boardData.board, row, col, currentActive }),
				pieces: boardData.pieces.map(piece => {
					const move = [row, col] as [number, number]
					if (piece.id === currentActive.id) {
						return { ...piece, position: move }
					}
					if (piece.position?.[0] === move[0] && piece.position?.[1] === move[1]) {
						return { ...piece, position: null }
					}
					return piece
				})
			}
		})
		setDragDatas({
			active: undefined,
			enabledCells: []
		})
	}
	return (
		<>
			<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
				<div className='ChessBoard'>
					<div className={`ChessBoardContainer${dragDatas.active ? ' isdragging' : ''}`} onClick={handleBoardClick}>
						<div className='Board'>
							{boardData.board.map((boardRow, rowIndex) => (
								<div key={rowIndex} className='Row'>
									{boardRow.map((boardCell, colIndex) => {
										const id = `${rowIndex}-${colIndex}`
										const piece = boardCell ? boardData.pieces.find(piece => piece.id === boardCell) : undefined
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
												playing={PLAYER}
											/>
										)
									})}
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
		</>
	)
}

export default ChessBoard
