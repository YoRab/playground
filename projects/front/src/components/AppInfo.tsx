import { Group, Image, Text, ThemeIcon } from '@mantine/core'
import type { ClientApp } from '@platform/client'

/** An app presented by its tinted icon, label and description (login page, board picker, overview); `label` overrides the app's name */
const AppInfo = ({ app, label = app.label, size = 48 }: { app: ClientApp; label?: string; size?: number }) => (
  <Group gap='md' wrap='nowrap'>
    <ThemeIcon size={size} radius='md' variant='light' color={app.color}>
      <Image src={app.icon} alt='' h={Math.round(size * 0.6)} w={Math.round(size * 0.6)} />
    </ThemeIcon>
    <div>
      <Text fw={600}>{label}</Text>
      <Text size='xs' c='dimmed'>
        {app.description}
      </Text>
    </div>
  </Group>
)

export default AppInfo
