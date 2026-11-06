import type { AppRouter } from '@back/app'
import { createTRPCReact } from '@platform/client'

export const trpc = createTRPCReact<AppRouter>()
