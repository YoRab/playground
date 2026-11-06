import { defineClientApp } from '@platform/client'
import { lazy } from 'react'

export default defineClientApp({
  label: 'Counter',
  Component: lazy(() => import('./Counter'))
})
