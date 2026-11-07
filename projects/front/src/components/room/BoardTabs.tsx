import type { AppType } from '@back/apps'
import AppIcon from '@front/components/AppIcon'
import { boardLabels } from '@front/utils/boardLabels'
import { ActionIcon, Tabs, Tooltip } from '@mantine/core'
import type { Board } from '@platform/model'
import { IconLayoutDashboard, IconPlus, IconTrash } from '@tabler/icons-react'
import classes from './Room.module.css'

/** What only the owner of a room can do with its boards */
export type OwnerActions = {
  /** Opens the board picker */
  onAdd: () => void
  /** Adds a board of this type */
  onPick: (type: AppType) => void
  onDelete: (boardId: string) => void
  adding: boolean
}

/** Value of the Overview tab: the main tab of every room, always first, never deleted */
const OVERVIEW = 'overview'

type BoardTabsProps = {
  boards: Board[]
  /** The active board; the overview when undefined */
  active: string | undefined
  onSelect: (boardId: string | undefined) => void
  owner?: OwnerActions | undefined
}

const BoardTabs = ({ boards, active, onSelect, owner }: BoardTabsProps) => {
  const labels = boardLabels(boards)

  return (
    <div className={classes.tabsRow}>
      <Tabs value={active ?? OVERVIEW} onChange={value => value && onSelect(value === OVERVIEW ? undefined : value)} className={classes.tabs}>
        <Tabs.List className={classes.tabsList}>
          <Tabs.Tab value={OVERVIEW} className={classes.tab} leftSection={<IconLayoutDashboard size={16} />}>
            Overview
          </Tabs.Tab>
          {boards.map((board, index) => (
            <Tabs.Tab key={board.id} value={board.id} className={classes.tab} leftSection={<AppIcon type={board.type} />}>
              {labels[index]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      {owner && (
        <>
          <Tooltip label='Add a board'>
            <ActionIcon variant='subtle' aria-label='Add a board' loading={owner.adding} onClick={owner.onAdd}>
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>
          {active && (
            <Tooltip label='Delete this board'>
              <ActionIcon
                className={classes.deleteBoard}
                variant='subtle'
                color='red'
                aria-label='Delete this board'
                onClick={() => owner.onDelete(active)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </>
      )}
    </div>
  )
}

export default BoardTabs
