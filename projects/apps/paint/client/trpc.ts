import { createTRPCReact } from '@platform/client'
import type { PaintApi } from '../server'

export const trpc = createTRPCReact<PaintApi>()
