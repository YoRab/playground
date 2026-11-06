import { randomUUID } from 'node:crypto'

import type { ChessAI } from '../../shared/types'

const AIs: ChessAI[] = []

const chessAIApi = {
  findAIMany: async () => AIs,
  findAIById: async (id: string) => AIs.find(ai => ai.id === id),
  findAIByPseudo: async (pseudo: string) => AIs.find(ai => ai.pseudo === pseudo),
  createAI: async (data: { pseudo: string }) => {
    const ai = { id: randomUUID(), type: 'AI', state: 'notReady', ...data } as const
    AIs.push(ai)
    return ai
  },
  updateAIState: async (data: { id: string; state: 'ready' | 'notReady' }) => {
    const aiIndex = AIs.findIndex(item => item.id === data.id)
    if (aiIndex < 0) return
    const updatedAi = {
      ...AIs[aiIndex],
      state: data.state
    }
    AIs[aiIndex] = updatedAi
    return updatedAi
  },
  findReadyAIs: async () => AIs.filter(ai => ai.state === 'ready')
}

export default chessAIApi
