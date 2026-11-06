import { createTopic } from '@platform/server'
import type { ChessGame } from '../shared/types'

/** A game changed: key = boardId */
export const gameTopic = createTopic('chess game')

/** It may be the turn of an AI: key = AI id, payload = boardId */
export const aiTurnTopic = createTopic<string>('chess AI turn')

/** Wakes up the AI playing in `game`, if any */
export const notifyAIPlayer = (game: Pick<ChessGame, 'id' | 'players'>) => {
  for (const player of [game.players.white, game.players.black]) {
    if (player && 'type' in player && player.type === 'AI') {
      aiTurnTopic.publish(player.id, game.id)
    }
  }
}
