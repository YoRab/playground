/**
 * Who is connected to what (a room, a board…), kept apart from the stored data.
 * A user can be connected several times (tabs): each `join` is counted until its `leave`.
 * `onChange` is called only when the set of distinct users of a key actually changes.
 */
export const createPresence = (onChange?: (key: string) => void) => {
  const connections = new Map<string, Map<symbol, string>>()

  const list = (key: string): string[] => [...new Set(connections.get(key)?.values())]

  return {
    /** Registers a connection of `userId` to `key`; call the returned function to remove it */
    join: (key: string, userId: string) => {
      const connectionId = Symbol(userId)
      const entry = connections.get(key) ?? new Map<symbol, string>()
      const isNewUser = !list(key).includes(userId)
      entry.set(connectionId, userId)
      connections.set(key, entry)
      if (isNewUser) onChange?.(key)

      return () => {
        if (!entry.delete(connectionId)) return
        if (entry.size === 0) connections.delete(key)
        if (!list(key).includes(userId)) onChange?.(key)
      }
    },
    /** Distinct ids of the users connected to `key`, in order of arrival */
    list
  }
}
