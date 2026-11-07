import { defineClientApp } from '@platform/client'
import { lazy } from 'react'
import icon from './assets/word.svg'

export default defineClientApp({
  label: 'Word',
  description: "A shared text: write together and see everyone's cursor",
  icon,
  color: 'blue',
  Component: lazy(() => import('./Word'))
})
