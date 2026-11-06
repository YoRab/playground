import type { TRPCRouterRecord } from '@trpc/server'
import type { User } from '../model'
import type { router } from './trpc'

type MaybePromise<T> = T | Promise<T>

/** Connection params of an external client (WebSocket `connectionParams`) */
export type ExternalParams = Record<string, string | undefined>

/**
 * A client of the app that lives outside the shell (a bot, an agent…): it does not log in with a nickname
 * but presents an API key, and talks to procedures that the shell's own client never sees.
 */
export type ExternalClient<TNamespace extends string = string, TRouter extends TRPCRouterRecord = TRPCRouterRecord> = {
  /** tRPC namespace of its procedures (`trpc.<namespace>.*`), hidden from the type of the shell client */
  namespace: TNamespace
  /** Permission granted by the API keys of the host configuration (back/src/constants/permissions.ts) */
  permission: string
  /**
   * Who is the external client, from its connection params. Returns null to refuse.
   * Annotate the parameter (`(params: ExternalParams) => …`): it lets TypeScript keep the precise type of `router`.
   */
  authenticate: (params: ExternalParams) => MaybePromise<User | null>
  /** Procedures reserved to the external client; guard them with `withPermissionsProcedure(permission)` */
  router: TRouter
}

export type ServerApp<
  TType extends string = string,
  TRouter extends TRPCRouterRecord = TRPCRouterRecord,
  TExternal extends ExternalClient | undefined = ExternalClient | undefined
> = {
  /**
   * Unique id of the app: stored on the boards and used as its tRPC namespace (`trpc.<type>.*`).
   * Must not collide with the namespaces of the host (`public`, `protected`) or of an external client.
   */
  type: TType
  /** Creates the state of a new board, when the room owner adds it. Returns undefined to refuse. */
  create: (args: { ownerId: string; roomId: string }) => MaybePromise<{ id: string } | undefined>
  /** Deletes the state of a board. Returns false to refuse. */
  remove: (args: { boardId: string; userId: string }) => MaybePromise<boolean>
  /** Procedures of the app, mounted under `type` */
  router: TRouter
  /** Optional: lets an external client (bot, agent…) play in the app. The host needs no knowledge of it. */
  external?: TExternal
}

export const defineServerApp = <
  const TType extends string,
  TRouter extends TRPCRouterRecord,
  const TExternal extends ExternalClient | undefined = undefined
>(
  app: ServerApp<TType, TRouter, TExternal>
) => app

/**
 * Type of the tRPC router reduced to one app: what the client of the app is typed against.
 * @example export type WordApi = AppApi<typeof word>
 */
export type AppApi<TApp extends ServerApp> = ReturnType<typeof router<Record<TApp['type'], TApp['router']>>>
