import { z } from 'zod'
import { ee, protectedProcedure } from '@back/services/trpc'
import { observable } from '@trpc/server/observable'

const REFRESH_REACT_PAINT = ['refreshReactPaint']
let REACTPAINT_DATA: unknown = {}

const reactPaintRouter = {
	setPaint: protectedProcedure.input(z.object({ value: z.unknown() })).mutation(async opts => {
		REACTPAINT_DATA = opts.input.value
		ee.emit('refreshReactPaint')
		return true
	}),
	onGetPaint: protectedProcedure.subscription(() => {
		return observable<unknown>(emit => {
			const onRefreshPaint = async () => {
				console.log('onGetPaint')
				emit.next(REACTPAINT_DATA)
			}

			for (const eventName of REFRESH_REACT_PAINT) {
				ee.on(eventName, onRefreshPaint)
			}
			onRefreshPaint()
			return () => {
				for (const eventName of REFRESH_REACT_PAINT) {
					ee.off(eventName, onRefreshPaint)
				}
			}
		})
	})
}

export default reactPaintRouter
