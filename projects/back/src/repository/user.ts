import type { User } from '@platform/model'
import { users as userApi } from '@platform/server'

export const findMany = async (): Promise<User[]> => userApi.findMany()

export const findUserById = async (id: string): Promise<User | null> => userApi.findById(id)
