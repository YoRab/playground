import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import icon from './assets/mine.svg'

export default defineClientApp({
  label: 'Mine.io',
  description: 'Real-time territory minesweeper, up to four players and bots',
  icon,
  color: 'orange',
  Component: lazy(() => import('./MineIo'))
})
