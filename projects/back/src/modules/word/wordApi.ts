import { v4 as uuidv4 } from 'uuid'

export type DBWord = {
  id: string
  roomId: string
  owner: string
  word: string
  createdAt: number
  updatedAt: number | null
}

let words: DBWord[] = []

const wordApi = {
  findMany: async () => words,

  findById: async (id: string) => words.find(word => word.id === id),

  create: async (data: { roomId: string; owner: string }) => {
    const word: DBWord = {
      id: uuidv4(),
      ...data,
      word: '',
      createdAt: Date.now(),
      updatedAt: null
    }
    words.push(word)
    return word
  },
  delete: async (data: { wordId: string }) => {
    words = words.filter(word => word.id !== data.wordId)
    return true
  },

  edit: async (data: {
    wordId: string
    newWord: string
  }) => {
    const wordIndex = words.findIndex(item => item.id === data.wordId)

    if (wordIndex < 0) return null

    words[wordIndex] = {
      ...words[wordIndex],
      word: data.newWord,
      updatedAt: Date.now()
    }
    return words[wordIndex]
  }
}

export default wordApi
