import { z } from 'zod'
import { ee, protectedProcedure } from '@back/services/trpc'
import { observable } from '@trpc/server/observable'
import * as reactPaintRepo from '@back/repository/reactPaint'
import { ReactPaint } from '@common/reactPaint'

const REFRESH_REACT_PAINT = ['refreshReactPaint']

const reactPaintRouter = {
	setPaint: protectedProcedure.input(z.object({ boardId: z.string(), value: z.unknown() })).mutation(async opts => {
		const { user } = opts.ctx
		const { boardId, value } = opts.input
		const board = await reactPaintRepo.findReactPaintById(boardId)
		if (!board) return false

		const refreshedPaint = await reactPaintRepo.editReactPaint(boardId, user!.id, value)
		refreshedPaint && ee.emit(`refreshReactPaint_${boardId}`)
		return refreshedPaint
	}),
	watchPaint: protectedProcedure
		.input(
			z.object({
				boardId: z.string()
			})
		)
		.subscription(async opts => {
			const { boardId } = opts.input
			const board = await reactPaintRepo.findReactPaintById(boardId)

			return observable<ReactPaint>(emit => {
				const onRefreshPaint = async () => {
					const board = await reactPaintRepo.findReactPaintById(boardId)
					board && emit.next(board)
				}

				if (!board) {
					emit.error('unknown board')
					return
				}

				const events = REFRESH_REACT_PAINT.map(eventName => `${eventName}_${boardId}`)

				for (const eventName of events) {
					ee.on(eventName, onRefreshPaint)
				}
				onRefreshPaint()
				return () => {
					for (const eventName of events) {
						ee.off(eventName, onRefreshPaint)
					}
				}
			})
		})
}

export default reactPaintRouter
