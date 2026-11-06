import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import whitePawn from './assets/pawn_white.svg'

export default defineClientApp({
  label: 'Chess board',
  icon: whitePawn,
  Component: lazy(() => import('./ChessBoard'))
})
