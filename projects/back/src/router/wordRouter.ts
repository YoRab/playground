import { z } from 'zod'
import { ee, protectedProcedure } from '@back/services/trpc'
import { observable } from '@trpc/server/observable'

const REFRESH_WORD_EVENTS = ['refreshWord']
let WORD = ''

const wordRouter = {
	setWord: protectedProcedure.input(z.object({ value: z.string() })).mutation(async opts => {
		WORD = opts.input.value
		ee.emit('refreshWord')
		return true
	}),
	onGetWord: protectedProcedure.subscription(() => {
		return observable<string>(emit => {
			const onRefreshWord = async () => {
				console.log('onRefreshWord')
				emit.next(WORD)
			}

			for (const eventName of REFRESH_WORD_EVENTS) {
				ee.on(eventName, onRefreshWord)
			}
			onRefreshWord()
			return () => {
				for (const eventName of REFRESH_WORD_EVENTS) {
					ee.off(eventName, onRefreshWord)
				}
			}
		})
	})
}

export default wordRouter
