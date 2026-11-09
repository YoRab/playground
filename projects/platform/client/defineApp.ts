import type { MantineColor } from '@mantine/core'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { Room, User } from '../model'
import type { Language, Messages } from './i18n'

/** Props given by the host to the component of an app */
export type AppProps = {
  user: User
  room: Room
  boardId: string
}

/** The texts of an app: its name and one short sentence, then whatever its screens show */
export type AppMessages = Messages & {
  /** Name of the app: board picker, tabs of the room, home cards, login page */
  label: string
  /** One short sentence shown under the label in the board picker and on the login page */
  description: string
}

export type ClientApp = {
  /**
   * The dictionaries of the app, one per language, registered by the host under the namespace of its type: the app reads
   * them with `useTranslation('<type>')`, once that namespace is declared next to the English one (see `Namespaces`)
   */
  messages: Record<Language, AppMessages>
  /** Image url (an imported asset). Shown in an `<img>`: `currentColor` does not follow the color scheme, give the colors explicitly */
  icon: string
  /** Accent of the app (Mantine color): tint of its icon, border of its tile on hover */
  color: MantineColor
  /** Board screen. Prefer `lazy(() => import('./MyApp'))`: each app then gets its own chunk. */
  Component: LazyExoticComponent<ComponentType<AppProps>> | ComponentType<AppProps>
}

export const defineClientApp = (app: ClientApp) => app
