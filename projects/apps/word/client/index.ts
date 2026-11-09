import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import icon from './assets/word.svg'
import en from './locales/en'
import fr from './locales/fr'

export default defineClientApp({
  messages: { en, fr },
  icon,
  color: 'blue',
  Component: lazy(() => import('./Word'))
})
