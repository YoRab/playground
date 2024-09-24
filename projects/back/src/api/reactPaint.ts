import { v4 as uuidv4 } from 'uuid'

export type DBReactPaint = {
	id: string
	sessionId: string
	owner: string
	data: unknown
	createdAt: number
	updatedAt: number | null
}

let reactPaints: DBReactPaint[] = []

const reactPaintApi = {
	findMany: async () => reactPaints,

	findById: async (id: string) => reactPaints.find(reactPaint => reactPaint.id === id),

	create: async (data: { sessionId: string; owner: string }) => {
		const reactPaint: DBReactPaint = {
			id: uuidv4(),
			...data,
			data: [],
			createdAt: Date.now(),
			updatedAt: null
		}
		reactPaints.push(reactPaint)
		return reactPaint
	},
	delete: async (data: { reactPaintId: string }) => {
		reactPaints = reactPaints.filter(reactPaint => reactPaint.id !== data.reactPaintId)
		return true
	},

	edit: async (data: {
		reactPaintId: string
		newData: unknown
	}) => {
		const reactPaintIndex = reactPaints.findIndex(item => item.id === data.reactPaintId)

		if (reactPaintIndex < 0) return null

		reactPaints[reactPaintIndex] = {
			...reactPaints[reactPaintIndex],
			data: data.newData,
			updatedAt: Date.now()
		}
		return reactPaints[reactPaintIndex]
	}
}

export default reactPaintApi
