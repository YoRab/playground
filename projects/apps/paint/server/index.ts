import { type AppApi, defineYDocApp } from '@platform/server'

// the shapes live in a Yjs document: shapes drawn at the same time merge, and the pointers of the others are shared (awareness)
// a picture pasted on the drawing travels as a data URL: bigger updates than a text
const paint = defineYDocApp({ type: 'paint', maxUpdateSize: 10_000_000 })

export default paint
export type PaintApi = AppApi<typeof paint>
