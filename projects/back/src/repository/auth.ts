import { encodeJwtToken } from '@back/utils/auth'
import { users as userApi } from '@platform/server'

export const login = async (user: { pseudo: string }): Promise<string> => {
  let userFound = userApi.findByPseudo(user.pseudo)
  if (!userFound) {
    userFound = userApi.create(user)
  }
  const token = encodeJwtToken(userFound)
  return token
}

export const logout = (): void => {
  return
}
