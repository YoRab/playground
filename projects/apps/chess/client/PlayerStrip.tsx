import { Badge, Group, Text } from '@mantine/core'
import { UserAvatar } from '@platform/client'
import type { ChessUser, PieceType } from '../shared/types'
import classes from './ChessBoard.module.css'
import Piece from './Piece'

type PlayerStripProps = {
  player: ChessUser | undefined
  color: PieceType['color']
  /** Pieces this player took from the other one */
  captured: PieceType[]
  /** This player has the move */
  active: boolean
  isMe: boolean
}

/** A player above or below the board: name, color, captured pieces, and whose turn it is */
const PlayerStrip = ({ player, color, captured, active, isMe }: PlayerStripProps) => (
  <div className={classes.strip} data-active={active || undefined}>
    <Group gap='xs' wrap='nowrap' miw={0}>
      <span className={classes.colorPiece}>
        <Piece piece={{ type: 'king', color }} />
      </span>
      <UserAvatar user={player && { id: player.id, name: player.pseudo }} size={26} />
      <Text fw={600} size='sm' truncate>
        {player ? player.pseudo : 'Waiting for a player'}
      </Text>
      {isMe && (
        <Text size='xs' c='dimmed'>
          (you)
        </Text>
      )}
      {player && 'type' in player && player.type === 'AI' && (
        <Badge size='xs' color='gray'>
          AI
        </Badge>
      )}
    </Group>
    <Group gap='xs' wrap='nowrap'>
      <div className={classes.captured}>
        {captured.map(piece => (
          <Piece key={piece.id} piece={piece} />
        ))}
      </div>
      {active && (
        <Badge variant='filled' size='sm'>
          {isMe ? 'Your turn' : 'To move'}
        </Badge>
      )}
    </Group>
  </div>
)

export default PlayerStrip
