import chess from '@apps/chess/server'
import mineio from '@apps/mineio/server'
import paint from '@apps/paint/server'
import word from '@apps/word/server'
import type { ExternalClient, ServerApp } from '@platform/server'

/** Server side of every app available in the rooms: adding an app = one line here (+ one in front/src/apps.ts) */
export const serverApps = [chess, mineio, paint, word] as const

type ServerApps = (typeof serverApps)[number]
export type AppType = ServerApps['type']

/** Routers of the apps, each one under its own namespace (`trpc.<type>.*`) */
type AppRouters = { [App in ServerApps as App['type']]: App['router'] }

type ExternalClientOf<App extends ServerApp> = NonNullable<App['external']> extends infer E extends ExternalClient ? E : never

/** Routers of the external clients (bots, agents…), served but kept out of the type of the shell client */
type ExternalRouters = { [E in ExternalClientOf<ServerApps> as E['namespace']]: E['router'] }

export const appTypes = serverApps.map(app => app.type) as [AppType, ...AppType[]]

// the namespaces of the host, shared with the ones of the apps
const HOST_NAMESPACES = ['public', 'protected']

const appsByType = new Map<string, ServerApp>(serverApps.map(app => [app.type, app]))
if (appsByType.size !== serverApps.length) throw new Error('Two apps share the same type')

const externalClients = serverApps.flatMap(app => (app.external ? [app.external as ExternalClient] : []))

const namespaces = [...HOST_NAMESPACES, ...appsByType.keys(), ...externalClients.map(client => client.namespace)]
const duplicate = namespaces.find((namespace, index) => namespaces.indexOf(namespace) !== index)
if (duplicate) throw new Error(`The tRPC namespace "${duplicate}" is used twice (host, app type or external client)`)

export const findServerApp = (type: string) => appsByType.get(type)

/** The external client an API key (through its permissions) gives access to, if any */
export const findExternalClient = (permissions: string[]) => externalClients.find(client => permissions.includes(client.permission))

export const appRouters = Object.fromEntries(serverApps.map(app => [app.type, app.router])) as AppRouters

export const externalRouters = Object.fromEntries(externalClients.map(client => [client.namespace, client.router])) as ExternalRouters
