import { type AppApi, defineSharedStateApp } from '@platform/server'
import { z } from 'zod'

// the shapes of @yorab/react-paint, stored as is
const paint = defineSharedStateApp({ type: 'paint', schema: z.array(z.unknown()), initial: (): unknown[] => [] })

export default paint
export type PaintApi = AppApi<typeof paint>
