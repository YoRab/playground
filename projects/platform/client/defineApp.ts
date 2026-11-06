import type { ComponentType, LazyExoticComponent } from 'react'
import type { Room, User } from '../model'

/** Props given by the host to the component of an app */
export type AppProps = {
  user: User
  room: Room
  boardId: string
}

export type ClientApp = {
  /** Shown in the "Create a new board" modal */
  label: string
  /** Image url shown next to the label */
  icon?: string
  /** Board screen. Prefer `lazy(() => import('./MyApp'))`: each app then gets its own chunk. */
  Component: LazyExoticComponent<ComponentType<AppProps>> | ComponentType<AppProps>
}

export const defineClientApp = (app: ClientApp) => app
