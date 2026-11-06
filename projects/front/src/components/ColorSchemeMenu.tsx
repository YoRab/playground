import { ActionIcon, type MantineColorScheme, Menu, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

const OPTIONS: { value: MantineColorScheme; label: string; Icon: typeof IconSun }[] = [
  { value: 'light', label: 'Light', Icon: IconSun },
  { value: 'dark', label: 'Dark', Icon: IconMoon },
  { value: 'auto', label: 'System', Icon: IconDeviceDesktop }
]

const ColorSchemeMenu = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')
  const CurrentIcon = computedColorScheme === 'dark' ? IconMoon : IconSun

  return (
    <Menu position='bottom-end' width={160}>
      <Menu.Target>
        <ActionIcon variant='default' size='lg' aria-label='Color scheme'>
          <CurrentIcon size={18} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {OPTIONS.map(({ value, label, Icon }) => (
          <Menu.Item
            key={value}
            leftSection={<Icon size={16} stroke={1.5} />}
            rightSection={colorScheme === value ? <IconCheck size={14} /> : null}
            onClick={() => setColorScheme(value)}
          >
            {label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}

export default ColorSchemeMenu
