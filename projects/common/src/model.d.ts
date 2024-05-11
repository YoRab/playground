export type User = {
	id: string
	pseudo: string
}

export type Session = {
	id: string
	owner?: User | null
	watchers: User[]
	createdAt: number
	boards: { type: string; id: string }[]
}
