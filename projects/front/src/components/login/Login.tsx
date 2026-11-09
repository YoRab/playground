import { clientAppEntries } from '@front/apps'
import AppInfo from '@front/components/AppInfo'
import useLocalStorage from '@front/hooks/useLocalStorage'
import { resetWsClient } from '@front/hooks/useTrpc'
import { trpc } from '@front/utils/trpc'
import { Button, Center, Container, Group, Image, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { errorMessage, getQueryKey, useTranslation } from '@platform/client'
import { IconArrowRight } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import classes from './Login.module.css'

const Login = () => {
  const { t } = useTranslation('host')
  const queryClient = useQueryClient()
  const { setItem } = useLocalStorage()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { pseudo: '' },
    validate: {
      pseudo: value => (value.trim().length < 2 ? t('login.tooShort') : null)
    }
  })

  const login = trpc.public.login.useMutation({
    meta: { handlesError: true },
    onSuccess: jwtToken => {
      setItem('jwt_token', jwtToken)
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.public.getMe) })
      resetWsClient()
    },
    onError: error => {
      form.setFieldError('pseudo', errorMessage(error))
    }
  })

  const submit = form.onSubmit(({ pseudo }) => {
    login.mutate({ pseudo })
  })

  return (
    <Center flex={1}>
      <Container size='lg' w='100%' py='xl'>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48} className={classes.grid}>
          <Stack gap='lg' className={classes.intro}>
            <Group gap='md' wrap='nowrap'>
              <Image src='./logo.svg' alt='' h={56} w={56} />
              <div>
                <Title order={1} className={classes.title}>
                  Playground
                </Title>
                <Text c='dimmed'>{t('login.tagline')}</Text>
              </div>
            </Group>
            <Stack gap='sm'>
              {clientAppEntries.map(([type]) => (
                <AppInfo key={type} type={type} size={44} />
              ))}
            </Stack>
          </Stack>

          <Paper withBorder shadow='md' p='xl' radius='lg' className={classes.form}>
            <form onSubmit={submit}>
              <Title order={3}>{t('login.title')}</Title>
              <Text c='dimmed' size='sm' mt={4}>
                {t('login.subtitle')}
              </Text>
              <TextInput
                mt='lg'
                size='md'
                label={t('login.nickname')}
                placeholder={t('login.placeholder')}
                autoFocus
                key={form.key('pseudo')}
                {...form.getInputProps('pseudo')}
              />
              <Button type='submit' fullWidth size='md' mt='lg' rightSection={<IconArrowRight size={18} />} loading={login.isPending}>
                {t('login.submit')}
              </Button>
            </form>
          </Paper>
        </SimpleGrid>
      </Container>
    </Center>
  )
}

export default Login
