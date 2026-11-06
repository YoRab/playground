import chess from '@apps/chess/client'
import counter from '@apps/counter/client'
import paint from '@apps/paint/client'
import word from '@apps/word/client'
import type { AppType } from '@back/apps'
import type { ClientApp } from '@platform/client'

/**
 * Client side of every app, in the order of the "Create a new board" modal.
 * `satisfies` makes the build fail if an app of back/src/apps.ts has no client here.
 */
export const clientApps = { chess, paint, word, counter } satisfies Record<AppType, ClientApp>

export const clientAppEntries = Object.entries(clientApps) as [AppType, ClientApp][]

export const findClientApp = (type: string): ClientApp | undefined => (Object.hasOwn(clientApps, type) ? clientApps[type as AppType] : undefined)
