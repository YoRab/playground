import useLocalStorage from '@front/hooks/useLocalStorage'
import { trpc } from '@front/utils/trpc'
import { Anchor, Button, Group, Image, Text } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import ColorSchemeMenu from './ColorSchemeMenu'

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

  const logout = () => {
    logoutMutation.mutate()
  }

  return (
    <Group h='100%' px='md' justify='space-between' component='nav' aria-label='main navigation'>
      <Anchor href='/' underline='never' c='inherit'>
        <Group gap='xs'>
          <Image src='./vite.svg' alt='logo' h={28} w='auto' />
          <Text fw={700} size='lg'>
            YRP
          </Text>
        </Group>
      </Anchor>

      <Group gap='sm'>
        {user ? (
          <Text size='sm' visibleFrom='xs'>
            Hello {user.pseudo}
          </Text>
        ) : null}
        <ColorSchemeMenu />
        {user ? (
          <Button variant='default' leftSection={<IconLogout size={16} />} onClick={logout} loading={logoutMutation.isPending}>
            Logout
          </Button>
        ) : null}
      </Group>
    </Group>
  )
}

export default Toolbar
