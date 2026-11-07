import { findClientApp } from '@front/apps'
import { Image } from '@mantine/core'
import { IconApps } from '@tabler/icons-react'

/** The icon of an app, from its type; a generic one for a type this client does not know */
const AppIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
  const app = findClientApp(type)
  return app ? <Image src={app.icon} alt='' h={size} w={size} /> : <IconApps size={size} />
}

export default AppIcon
