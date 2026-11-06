import type { ChessAI } from '../../shared/types'
import chessAIApi from './store'

export const findAIMany = async (): Promise<ChessAI[]> => {
  const ais = await chessAIApi.findAIMany()
  return ais
}

export const findAIById = async (id: string): Promise<ChessAI | undefined> => {
  const ai = await chessAIApi.findAIById(id)
  return ai
}

export const findReadyAIs = async (): Promise<ChessAI[]> => {
  const ai = await chessAIApi.findReadyAIs()
  return ai
}

export const findOrCreateAI = async (name: string): Promise<ChessAI> => {
  return (await chessAIApi.findAIByPseudo(name)) ?? chessAIApi.createAI({ pseudo: name })
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
