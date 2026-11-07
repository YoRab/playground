import { VISIBILITIES } from '@front/utils/roomVisibility'
import { ThemeIcon, type ThemeIconProps, Tooltip } from '@mantine/core'
import type { RoomVisibility } from '@platform/model'

type VisibilityBadgeProps = {
  visibility: RoomVisibility
  /** Size of the icon in px, the badge is a bit bigger */
  iconSize: number
} & Pick<ThemeIconProps, 'size' | 'className'>

/** The visibility of a room as an icon, explained in a tooltip: room cards and room header */
const VisibilityBadge = ({ visibility, iconSize, size, className }: VisibilityBadgeProps) => {
  const { label, description, icon: Icon } = VISIBILITIES[visibility]
  return (
    <Tooltip label={`${label}: ${description.toLowerCase()}`}>
      <ThemeIcon className={className} variant='light' color='gray' size={size} radius='xl' aria-label={label}>
        <Icon size={iconSize} />
      </ThemeIcon>
    </Tooltip>
  )
}

export default VisibilityBadge
