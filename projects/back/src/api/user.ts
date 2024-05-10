import { v4 as uuidv4 } from "uuid";

export type DBUser = {
	id: string;
	pseudo: string;
};

const users: DBUser[] = [];

const user = {
	findMany: async () => users,
	findById: async (id: string) => users.find((user) => user.id === id) ?? null,
	findByPseudo: async (pseudo: string) =>
		users.find((user) => user.pseudo === pseudo) ?? null,
	create: async (data: { pseudo: string }) => {
		const user = { id: uuidv4(), ...data };
		users.push(user);
		return user;
	},
};

export default user;
