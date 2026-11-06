import { defineClientApp } from '@platform/client'
import { lazy } from 'react'

export default defineClientApp({
  label: 'Paint (incoming)',
  Component: lazy(() => import('./Paint'))
})
