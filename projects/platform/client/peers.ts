import { useEffect, useMemo, useState } from 'react'
import type { Awareness } from 'y-protocols/awareness'
import { z } from 'zod'
import { userColor } from './userColor'

/** CSS value of a participant color */
export const peerColorVar = (color: string) => `var(--mantine-color-${color}-6)`

// the states come from the other clients: validated before use
const userStateSchema = z.object({ user: z.object({ id: z.string(), name: z.string() }) })

/** A participant (one tab): the fields of its awareness state, plus its color (derived from the user id, so not published) */
export type Peer<TState = unknown> = TState & {
  clientId: number
  user: { id: string; name: string }
  color: string
}

const readPeers = <TState>(awareness: Awareness, schema: z.ZodType<{ user: { id: string; name: string } } & TState>): Peer<TState>[] =>
  [...awareness.getStates()].flatMap(([clientId, state]) => {
    const parsed = schema.safeParse(state)
    return parsed.success ? [{ ...parsed.data, clientId, color: userColor(parsed.data.user.id) }] : []
  })

/**
 * Every participant of the board, the local one included (`clientId === doc.clientID`). `schema` validates the fields
 * the app adds to the awareness state: give a constant, its identity is a dependency.
 *
 * @example usePeers(board.awareness, z.object({ pointer: z.tuple([z.number(), z.number()]).nullable().catch(null) }))
 */
export const usePeers = <TState>(awareness: Awareness, schema: z.ZodType<TState>) => {
  // one parse per state: the user and the fields of the app together
  const stateSchema = useMemo(() => userStateSchema.and(schema), [schema])
  const [peers, setPeers] = useState(() => readPeers(awareness, stateSchema))

  useEffect(() => {
    const onChange = () => setPeers(readPeers(awareness, stateSchema))
    onChange()
    awareness.on('change', onChange)
    return () => awareness.off('change', onChange)
  }, [awareness, stateSchema])

  return peers
}
