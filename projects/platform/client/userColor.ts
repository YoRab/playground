/** Mantine colors given to the users, picked from their user id */
const USER_COLORS = ['blue', 'red', 'teal', 'grape', 'orange', 'cyan', 'pink', 'lime', 'violet', 'indigo'] as const

/** Color of a user (Mantine color), the same everywhere: avatars, carets and pointers on the boards */
export const userColor = (userId: string) => {
  let hash = 0
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}
