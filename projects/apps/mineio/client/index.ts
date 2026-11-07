import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import icon from './assets/mine.svg'

export default defineClientApp({
  label: 'Mine.io',
  icon,
  Component: lazy(() => import('./MineIo'))
})
