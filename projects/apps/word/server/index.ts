import { type AppApi, defineYDocApp } from '@platform/server'

// the text lives in a Yjs document: concurrent edits merge, and the cursors of the others are shared (awareness)
const word = defineYDocApp({ type: 'word' })

export default word
export type WordApi = AppApi<typeof word>
