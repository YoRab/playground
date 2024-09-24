import userApi from '@back/api/user'
import wordApi, { DBWord } from '@back/api/word'
import { Word } from '@common/word'

const resolveUsers = async (word?: DBWord): Promise<Word | undefined> => {
	if (word === undefined) return undefined

	const owner = (await userApi.findById(word.owner))!
	return {
		...word,
		owner
	}
}

export const findMany = async (): Promise<Word[]> => {
	const words = await wordApi.findMany()
	const promises = words.map(async session => (await resolveUsers(session))!)
	return Promise.all(promises)
}

export const findWordById = async (id: string): Promise<Word | undefined> => {
	const game = await wordApi.findById(id)
	return resolveUsers(game)
}

export const createWord = async (owner: string, sessionId: string): Promise<Word | undefined> => {
	const userFound = await userApi.findById(owner)
	if (!userFound) {
		return
	}
	const word = await wordApi.create({ sessionId, owner })
	return resolveUsers(word)
}

export const deleteWord = async (wordId: string, ownerId: string): Promise<boolean> => {
	const word = await wordApi.findById(wordId)
	if (!word) {
		return false
	}

	const userFound = await userApi.findById(ownerId)
	if (!userFound) {
		return false
	}

	if (word.owner !== ownerId) return false

	await wordApi.delete({ wordId })
	return true
}

export const editWord = async (wordId: string, userId: string, newWord: string): Promise<Word | false> => {
	const word = await wordApi.findById(wordId)
	if (!word) return false

	const userFound = await userApi.findById(userId)
	if (!userFound) return false

	const refreshedWord = await wordApi.edit({
		wordId,
		newWord
	})

	return (await resolveUsers(refreshedWord!)) ?? false
}
