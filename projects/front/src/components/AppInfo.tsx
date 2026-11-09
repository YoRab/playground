import { findClientApp } from '@front/apps'
import { useAppTexts } from '@front/hooks/useAppTexts'
import { Group, Image, Text, ThemeIcon } from '@mantine/core'

/** An app presented by its tinted icon, label and description (login page, board picker, overview); `label` overrides the app's name */
const AppInfo = ({ type, label, size = 48 }: { type: string; label?: string; size?: number }) => {
  const app = findClientApp(type)
  const texts = useAppTexts()(type)
  return (
    <Group gap='md' wrap='nowrap'>
      <ThemeIcon size={size} radius='md' variant='light' color={app?.color}>
        <Image src={app?.icon} alt='' h={Math.round(size * 0.6)} w={Math.round(size * 0.6)} />
      </ThemeIcon>
      <div>
        <Text fw={600}>{label ?? texts.label}</Text>
        <Text size='xs' c='dimmed'>
          {texts.description}
        </Text>
      </div>
    </Group>
  )
}

export default AppInfo
