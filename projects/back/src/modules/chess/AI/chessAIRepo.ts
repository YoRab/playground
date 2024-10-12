import chessAIApi from '@back/modules/chess/AI/chessAIApi'
import type { ChessAI } from '@common/chess'

export const findAIMany = async (): Promise<ChessAI[]> => {
  const ais = await chessAIApi.findAIMany()
  return ais
}

export const findAIById = async (id: string): Promise<ChessAI | undefined> => {
  const ai = await chessAIApi.findAIById(id)
  return ai
}

export const findAIByPseudo = async (pseudo: string): Promise<ChessAI | undefined> => {
  const ai = await chessAIApi.findAIByPseudo(pseudo)
  return ai
}
export const findReadyAIs = async (): Promise<ChessAI[]> => {
  const ai = await chessAIApi.findReadyAIs()
  return ai
}

export const createAI = async (name: string): Promise<ChessAI | null> => {
  const aiFound = await chessAIApi.findAIByPseudo(name)
  if (aiFound) return null
  return chessAIApi.createAI({ pseudo: name })
}

export const startAI = async (id: string): Promise<ChessAI | null> => {
  const startedAI = await chessAIApi.updateAIState({ id, state: 'ready' })
  if (!startedAI) return null
  return startedAI
}

export const stopAI = async (id: string): Promise<ChessAI | null> => {
  const startedAI = await chessAIApi.updateAIState({ id, state: 'notReady' })
  if (!startedAI) return null
  return startedAI
}
