import type { AppType } from '@back/apps'
import { clientAppEntries } from '@front/apps'
import AppInfo from '@front/components/AppInfo'
import { SimpleGrid, UnstyledButton } from '@mantine/core'
import type { CSSProperties } from 'react'
import classes from './Room.module.css'

/** One tile per app: the "Add a board" modal and the empty room of the owner */
const AppPicker = ({ onPick, disabled }: { onPick: (type: AppType) => void; disabled?: boolean }) => (
  <SimpleGrid cols={{ base: 1, xs: 2 }} spacing='sm'>
    {clientAppEntries.map(([type, app]) => (
      <UnstyledButton
        key={type}
        className={classes.tile}
        style={{ '--tile-color': `var(--mantine-color-${app.color}-filled)` } as CSSProperties}
        disabled={disabled}
        onClick={() => onPick(type)}
      >
        <AppInfo type={type} />
      </UnstyledButton>
    ))}
  </SimpleGrid>
)

export default AppPicker
