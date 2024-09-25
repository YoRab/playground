import userApi from '@back/api/user'
import { encodeJwtToken } from '@back/utils/auth'

export const login = async (user: { pseudo: string }): Promise<string> => {
  let userFound = await userApi.findByPseudo(user.pseudo)
  if (!userFound) {
    userFound = await userApi.create(user)
  }
  const token = encodeJwtToken(userFound)
  return token
}

export const logout = (): void => {
  return
}
