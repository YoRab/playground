import { createPresence, createTopic } from '@platform/server'

/** The list of rooms changed (single key: ROOMS_KEY) */
export const roomsTopic = createTopic('rooms')
export const ROOMS_KEY = 'all'
export const notifyRooms = () => roomsTopic.publish(ROOMS_KEY)

/** A room changed: key = roomId */
export const roomTopic = createTopic('room')

/** Who is in which room: the watchers shown in the room and in the rooms list */
export const roomPresence = createPresence(roomId => {
  roomTopic.publish(roomId)
  notifyRooms()
})
