import { v4 as uuidv4 } from 'uuid'

export type DBSession = {
  id: string
  owner: string
  watchers: [string, string][]
  createdAt: number
  boards: { type: string; id: string }[]
}

let sessions: DBSession[] = []

const gameApi = {
  findMany: async () => sessions,

  findById: async (id: string) => sessions.find(session => session.id === id),

  create: async (data: { owner: string }) => {
    const session: DBSession = {
      id: uuidv4(),
      ...data,
      watchers: [],
      createdAt: Date.now(),
      boards: []
    }
    sessions.push(session)
    return session
  },
  delete: async (data: { sessionId: string }) => {
    sessions = sessions.filter(session => session.id !== data.sessionId)
    return true
  },
  addWatcher: async (data: { socketId: string; userId: string; session: string }) => {
    const sessionIndex = sessions.findIndex(item => item.id === data.session)
    if (sessionIndex < 0) return null

    const isSocketAlreadyRegistered = sessions[sessionIndex].watchers.find(([socket, _user]) => socket === data.socketId) !== undefined
    if (isSocketAlreadyRegistered) return sessions[sessionIndex]

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      watchers: [...sessions[sessionIndex].watchers, [data.socketId, data.userId]]
    }
    return sessions[sessionIndex]
  },
  removeWatcher: async (data: { socketId: string; session: string }) => {
    const sessionIndex = sessions.findIndex(item => item.id === data.session)
    if (sessionIndex < 0) return null

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      watchers: sessions[sessionIndex].watchers.filter(([socket, _user]) => socket !== data.socketId)
    }
    return sessions[sessionIndex]
  },
  addBoard: async (data: { boardId: string; sessionId: string; type: string }) => {
    const sessionIndex = sessions.findIndex(item => item.id === data.sessionId)

    if (sessionIndex < 0) return null

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      boards: [...sessions[sessionIndex].boards, { type: data.type, id: data.boardId }]
    }
    return sessions[sessionIndex]
  },
  removeBoard: async (data: { boardId: string; sessionId: string }) => {
    const sessionIndex = sessions.findIndex(item => item.id === data.sessionId)
    if (sessionIndex < 0) return null

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      boards: sessions[sessionIndex].boards.filter(board => board.id !== data.boardId)
    }
    return sessions[sessionIndex]
  }
}

export default gameApi
