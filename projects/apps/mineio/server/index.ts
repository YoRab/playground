import { type AppApi, defineServerApp } from '@platform/server'
import * as repo from './repo'
import { mineioRouter } from './router'

/**
 * mine.io (sibling repository ../mine.io, linked): the server is the authority. It runs the match (rules and bots)
 * and only ever sends the public view of the grid: the hidden mines never leave it.
 */
const mineio = defineServerApp({
  type: 'mineio',
  create: repo.createBoard,
  remove: repo.removeBoard,
  router: mineioRouter
})

export default mineio
export type MineIoApi = AppApi<typeof mineio>
