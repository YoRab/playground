import { defineClientApp } from '@platform/client'
import { lazy } from 'react'

export default defineClientApp({
  label: 'Word (incoming)',
  Component: lazy(() => import('./Word'))
})
