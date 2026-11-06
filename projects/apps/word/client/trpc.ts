import { createTRPCReact } from '@platform/client'
import type { WordApi } from '../server'

export const trpc = createTRPCReact<WordApi>()
