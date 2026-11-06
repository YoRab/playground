import { createTRPCReact } from '@platform/client'
import type { ChessApi } from '../server'

export const trpc = createTRPCReact<ChessApi>()
