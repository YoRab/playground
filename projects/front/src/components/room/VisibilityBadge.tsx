import { VISIBILITY_ICONS } from '@front/utils/roomVisibility'
import { ThemeIcon, type ThemeIconProps, Tooltip } from '@mantine/core'
import { useTranslation } from '@platform/client'
import type { RoomVisibility } from '@platform/model'

type VisibilityBadgeProps = {
  visibility: RoomVisibility
  /** Size of the icon in px, the badge is a bit bigger */
  iconSize: number
} & Pick<ThemeIconProps, 'size' | 'className'>

/** The visibility of a room as an icon, explained in a tooltip: room cards and room header */
const VisibilityBadge = ({ visibility, iconSize, size, className }: VisibilityBadgeProps) => {
  const { t } = useTranslation('host')
  const Icon = VISIBILITY_ICONS[visibility]
  return (
    <Tooltip label={t(`visibility.${visibility}.tooltip`)}>
      <ThemeIcon className={className} variant='light' color='gray' size={size} radius='xl' aria-label={t(`visibility.${visibility}.label`)}>
        <Icon size={iconSize} />
      </ThemeIcon>
    </Tooltip>
  )
}

export default VisibilityBadge
