import { z } from 'zod'
import { ee, protectedProcedure } from '@back/services/trpc'
import { observable } from '@trpc/server/observable'
import * as wordRepo from '@back/repository/word'
import { Word } from '@common/word'

const REFRESH_WORD_EVENTS = ['refreshWord']

const wordRouter = {
	setWord: protectedProcedure.input(z.object({ wordId: z.string(), value: z.string() })).mutation(async opts => {
		const { user } = opts.ctx
		const { wordId, value } = opts.input
		const word = await wordRepo.findWordById(wordId)
		if (!word) return false

		const refreshedWord = await wordRepo.editWord(wordId, user!.id, value)
		refreshedWord && ee.emit(`refreshWord_${wordId}`)
		return refreshedWord
	}),
	watchWord: protectedProcedure
		.input(
			z.object({
				wordId: z.string()
			})
		)
		.subscription(async opts => {
			const { wordId } = opts.input
			const word = await wordRepo.findWordById(wordId)

			return observable<Word>(emit => {
				const onRefreshWord = async () => {
					const refreshedWord = await wordRepo.findWordById(wordId)
					refreshedWord && emit.next(refreshedWord)
				}

				if (!word) {
					emit.error('unknown word')
					return
				}

				const events = REFRESH_WORD_EVENTS.map(eventName => `${eventName}_${wordId}`)

				for (const eventName of events) {
					ee.on(eventName, onRefreshWord)
				}
				onRefreshWord()

				return () => {
					for (const eventName of events) {
						ee.off(eventName, onRefreshWord)
					}
				}
			})
		})
}

export default wordRouter
