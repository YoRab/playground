import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import whitePawn from './assets/pawn_white.svg'
import en from './locales/en'
import fr from './locales/fr'

export default defineClientApp({
  messages: { en, fr },
  icon: whitePawn,
  color: 'teal',
  Component: lazy(() => import('./ChessBoard'))
})
