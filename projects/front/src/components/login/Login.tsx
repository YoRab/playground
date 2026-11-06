import useLocalStorage from '@front/hooks/useLocalStorage'
import { resetWsClient } from '@front/hooks/useTrpc'
import { trpc } from '@front/utils/trpc'
import { Button, Container, Paper, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { getQueryKey } from '@platform/client'
import { useQueryClient } from '@tanstack/react-query'

const Login = () => {
  const queryClient = useQueryClient()
  const { setItem } = useLocalStorage()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { pseudo: '' },
    validate: {
      pseudo: value => (value.trim().length < 2 ? 'Your nickname must contain at least 2 letters' : null)
    }
  })

  const login = trpc.public.login.useMutation({
    meta: { handlesError: true },
    onSuccess: jwtToken => {
      setItem('jwt_token', jwtToken)
      const postListKey = getQueryKey(trpc.public.getMe)
      queryClient.invalidateQueries({ queryKey: postListKey })
      resetWsClient()
    },
    onError: error => {
      form.setFieldError('pseudo', error.message)
    }
  })

  const submit = form.onSubmit(({ pseudo }) => {
    login.mutate({ pseudo })
  })

  return (
    <Container size={420} my={40} w='100%'>
      <Title ta='center'>Playground</Title>
      <Text c='dimmed' size='sm' ta='center' mt={5}>
        Play chess and other stuff
      </Text>

      <Paper withBorder shadow='sm' p={22} mt={30} radius='md'>
        <form onSubmit={submit}>
          <TextInput label='Nickname' placeholder='Choose a nickname' data-autofocus key={form.key('pseudo')} {...form.getInputProps('pseudo')} />
          <Button type='submit' fullWidth mt='xl' loading={login.isPending}>
            Start
          </Button>
        </form>
      </Paper>
    </Container>
  )
}

export default Login
