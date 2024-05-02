import { JWT_SECRET_KEY } from "../constants/jwt";
import jwt from 'jsonwebtoken'
import { findUserById } from "../repository/user";
import { User } from "chesscommon/src/model";

export const decodeJwtToken = async (token: string): Promise<User | null> => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string };
        const user = await findUserById(decoded?.id);
        return user
    } catch (err) {
        return null
    }
}
export const encodeJwtToken = (user: User): string => {
    const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);
    return token
}