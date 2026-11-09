import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import icon from './assets/paint.svg'
import en from './locales/en'
import fr from './locales/fr'

export default defineClientApp({
  messages: { en, fr },
  icon,
  color: 'pink',
  Component: lazy(() => import('./Paint'))
})
