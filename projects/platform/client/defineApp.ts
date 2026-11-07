import type { MantineColor } from '@mantine/core'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { Room, User } from '../model'

/** Props given by the host to the component of an app */
export type AppProps = {
  user: User
  room: Room
  boardId: string
}

export type ClientApp = {
  /** Name of the app: board picker, tabs of the room, login page */
  label: string
  /** One short sentence shown under the label in the board picker and on the login page */
  description: string
  /** Image url (an imported asset). Shown in an `<img>`: `currentColor` does not follow the color scheme, give the colors explicitly */
  icon: string
  /** Accent of the app (Mantine color): tint of its icon, border of its tile on hover */
  color: MantineColor
  /** Board screen. Prefer `lazy(() => import('./MyApp'))`: each app then gets its own chunk. */
  Component: LazyExoticComponent<ComponentType<AppProps>> | ComponentType<AppProps>
}

export const defineClientApp = (app: ClientApp) => app
