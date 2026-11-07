import { createTRPCReact } from '@platform/client'
import type { MineIoApi } from '../server'

export const trpc = createTRPCReact<MineIoApi>()
