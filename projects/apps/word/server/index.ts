import { type AppApi, defineSharedStateApp } from '@platform/server'
import { z } from 'zod'

const word = defineSharedStateApp({ type: 'word', schema: z.string(), initial: () => '' })

export default word
export type WordApi = AppApi<typeof word>
