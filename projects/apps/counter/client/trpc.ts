import { createTRPCReact } from '@platform/client'
import type { CounterApi } from '../server'

export const trpc = createTRPCReact<CounterApi>()
