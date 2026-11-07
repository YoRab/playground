import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import whitePawn from './assets/pawn_white.svg'

export default defineClientApp({
  label: 'Chess',
  description: 'Play a friend or an AI, every move checked by the server',
  icon: whitePawn,
  color: 'teal',
  Component: lazy(() => import('./ChessBoard'))
})
