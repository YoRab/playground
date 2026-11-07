import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import icon from './assets/paint.svg'

export default defineClientApp({
  label: 'Paint',
  description: "A shared canvas: draw together and see everyone's pointer",
  icon,
  color: 'pink',
  Component: lazy(() => import('./Paint'))
})
