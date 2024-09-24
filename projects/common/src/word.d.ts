import { User } from '@common/model'

export type Word = {
	id: string
	sessionId: string
	owner: User
	word: string
	createdAt: number
	updatedAt: number | null
}
