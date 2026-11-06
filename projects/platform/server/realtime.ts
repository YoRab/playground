import { EventEmitter, on } from 'node:events'
import { TRPCError } from '@trpc/server'

// One in-process bus for every topic: a single server process, like the in-memory storage
const bus = new EventEmitter()
// every subscription adds listeners (`on()` also listens to 'error'), so the default limit of 10 is meaningless here
bus.setMaxListeners(0)

export type Topic<Payload = void> = {
  name: string
  publish: (key: string, ...payload: Payload extends void ? [] : [Payload]) => void
  /**
   * Starts listening right away (events are buffered until consumed).
   * Iterate it, or call `return()` to stop listening.
   */
  listen: (key: string, signal?: AbortSignal) => AsyncIterableIterator<Payload>
}

/** A typed channel: `publish(key)` wakes up every `listen(key)` of the same topic */
export const createTopic = <Payload = void>(name: string): Topic<Payload> => {
  const eventName = (key: string) => `${name}:${key}`

  return {
    name,
    publish: (key, ...payload) => {
      bus.emit(eventName(key), payload[0])
    },
    listen: (key, signal) => {
      const source = on(bus, eventName(key), { signal })
      const iterator: AsyncIterableIterator<Payload> = {
        async next() {
          const result = await source.next()
          return result.done ? { done: true, value: undefined } : { done: false, value: (result.value as [Payload])[0] }
        },
        async return() {
          await source.return?.()
          return { done: true, value: undefined }
        },
        [Symbol.asyncIterator]() {
          return iterator
        }
      }
      return iterator
    }
  }
}

/**
 * Body of a "live" subscription: yields `fetch()` once, then again each time `topic` is published for `key`.
 * Throws NOT_FOUND when the first fetch returns undefined.
 *
 * @example
 * watch: protectedProcedure.input(z.object({ boardId: z.string() })).subscription(({ input, signal }) =>
 *   liveQuery({ topic, key: input.boardId, fetch: () => store.find(input.boardId), signal }))
 */
export async function* liveQuery<T, Payload>({
  topic,
  key,
  fetch,
  signal
}: {
  topic: Topic<Payload>
  key: string
  fetch: () => T | undefined | Promise<T | undefined>
  signal: AbortSignal | undefined
}): AsyncGenerator<T> {
  // listen before the first read so that no change can be missed in between
  const changes = topic.listen(key, signal)
  try {
    const initial = await fetch()
    if (initial === undefined) {
      throw new TRPCError({ code: 'NOT_FOUND', message: `unknown ${topic.name}` })
    }
    yield initial

    for await (const _change of changes) {
      const next = await fetch()
      if (next !== undefined) yield next
    }
  } catch (err) {
    // the client went away: ending quietly is the expected outcome
    if (signal?.aborted) return
    throw err
  } finally {
    await changes.return?.()
  }
}
