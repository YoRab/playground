export type User = {
    id: string
    pseudo: string
};

export type Game = {
    id: string
    owner?: User | null
    players: [User, User] | [User] | []
    watchers: User[]
    createdAt: number
    startedAt: number | null
};
