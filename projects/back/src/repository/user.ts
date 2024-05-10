import userApi from '@back/api/user'
import type { User } from '@common/model'

export const findMany = async (): Promise<User[]> => {
	const users = await userApi.findMany()
	return users
}

export const findUserById = async (id: string): Promise<User | null> => {
	const user = await userApi.findById(id)
	return user
}
