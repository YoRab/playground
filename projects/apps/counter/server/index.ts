import { type AppApi, defineSharedStateApp } from '@platform/server'
import { z } from 'zod'

const counter = defineSharedStateApp({ type: 'counter', schema: z.number().int(), initial: () => 0 })

export default counter
export type CounterApi = AppApi<typeof counter>
