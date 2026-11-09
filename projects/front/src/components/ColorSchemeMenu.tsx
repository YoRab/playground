import { ActionIcon, type MantineColorScheme, Menu, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { useTranslation } from '@platform/client'
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

const OPTIONS: { value: MantineColorScheme; Icon: typeof IconSun }[] = [
  { value: 'light', Icon: IconSun },
  { value: 'dark', Icon: IconMoon },
  { value: 'auto', Icon: IconDeviceDesktop }
]

const ColorSchemeMenu = () => {
  const { t } = useTranslation('host')
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')
  const CurrentIcon = computedColorScheme === 'dark' ? IconMoon : IconSun

  return (
    <Menu position='bottom-end' width={160}>
      <Menu.Target>
        <ActionIcon variant='default' size='lg' aria-label={t('toolbar.colorScheme')}>
          <CurrentIcon size={18} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {OPTIONS.map(({ value, Icon }) => (
          <Menu.Item
            key={value}
            leftSection={<Icon size={16} stroke={1.5} />}
            rightSection={colorScheme === value ? <IconCheck size={14} /> : null}
            onClick={() => setColorScheme(value)}
          >
            {t(`colorScheme.${value}`)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}

export default ColorSchemeMenu
