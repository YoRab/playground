import useLocalStorage from '@front/hooks/useLocalStorage'
import { trpc } from '@front/utils/trpc'
import { Anchor, Group, Image, Menu, Text, UnstyledButton } from '@mantine/core'
import { UserAvatar } from '@platform/client'
import { IconChevronDown, IconLogout } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import ColorSchemeMenu from './ColorSchemeMenu'
import classes from './Toolbar.module.css'

const Toolbar = () => {
  const { setItem } = useLocalStorage()
  const queryClient = useQueryClient()

  const userQuery = trpc.public.getMe.useQuery()
  const user = userQuery.data

  const logoutMutation = trpc.protected.logout.useMutation({
    onSuccess: () => {
      setItem('jwt_token', null)
      queryClient.invalidateQueries()
    }
  })

  return (
    <Group h='100%' px='md' justify='space-between' component='nav' aria-label='main navigation'>
      <Anchor href='#/home' underline='never' c='inherit'>
        <Group gap={10}>
          <Image src='./logo.svg' alt='' h={30} w={30} />
          <Text className={classes.brand}>Playground</Text>
        </Group>
      </Anchor>

      <Group gap='sm'>
        <ColorSchemeMenu />
        {user && (
          <Menu position='bottom-end' width={200}>
            <Menu.Target>
              <UnstyledButton className={classes.user} aria-label='Account'>
                <Group gap={8} wrap='nowrap'>
                  <UserAvatar user={{ id: user.id, name: user.pseudo }} size={30} />
                  <Text size='sm' fw={500} visibleFrom='sm' maw={160} truncate>
                    {user.pseudo}
                  </Text>
                  <IconChevronDown size={14} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Signed in as {user.pseudo}</Menu.Label>
              <Menu.Item
                leftSection={<IconLogout size={16} stroke={1.5} />}
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Log out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Group>
  )
}

export default Toolbar
