import { v4 as uuidv4 } from 'uuid'

export type DBChessAI = {
  id: string
  pseudo: string
  type: 'AI'
  state: 'ready' | 'notReady'
}

const AIs: DBChessAI[] = []

const chessAIApi = {
  findAIMany: async () => AIs,
  findAIById: async (id: string) => AIs.find(ai => ai.id === id),
  findAIByPseudo: async (pseudo: string) => AIs.find(ai => ai.pseudo === pseudo),
  createAI: async (data: { pseudo: string }) => {
    const ai = { id: uuidv4(), type: 'AI', state: 'notReady', ...data } as const
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
