import { trpc } from '@front/utils/trpc'
import { Button, Center, Loader, Paper, PasswordInput, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { errorMessage, useTranslation } from '@platform/client'
import type { LockedRoom, RoomLockReason } from '@platform/model'
import { type Icon, IconArrowLeft, IconEyeOff, IconLock, IconUsers, IconUserX } from '@tabler/icons-react'
import type { ReactNode } from 'react'

const ICONS: Record<RoomLockReason, { icon: Icon; color?: string }> = {
  password: { icon: IconLock },
  full: { icon: IconUsers },
  private: { icon: IconEyeOff, color: 'gray' },
  banned: { icon: IconUserX, color: 'red' }
}

/** Enters a protected room: once the password is accepted, the room subscription lets the user in */
const PasswordForm = ({ roomId }: { roomId: string }) => {
  const { t } = useTranslation('host')
  const form = useForm({ mode: 'uncontrolled', initialValues: { password: '' } })
  const join = trpc.protected.joinRoom.useMutation({
    meta: { handlesError: true },
    onError: error => form.setFieldError('password', errorMessage(error))
  })

  const submit = form.onSubmit(({ password }) => {
    if (password) join.mutate({ roomId, password })
  })

  return (
    <form onSubmit={submit} style={{ width: '100%' }}>
      <Stack gap='sm'>
        <Text size='sm' c='dimmed'>
          {t('locked.protected')}
        </Text>
        <PasswordInput
          aria-label={t('settings.password')}
          placeholder={t('settings.password')}
          autoFocus
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <Button type='submit' fullWidth loading={join.isPending}>
          {t('locked.join')}
        </Button>
      </Stack>
    </form>
  )
}

const Message = ({ children }: { children: ReactNode }) => (
  <Text size='sm' c='dimmed'>
    {children}
  </Text>
)

/** A room the user cannot enter (yet): the password to type, a spot to wait for, or why they are kept out */
const RoomLocked = ({ room, reason }: { room: LockedRoom; reason: RoomLockReason }) => {
  const { t } = useTranslation('host')
  const { icon: ReasonIcon, color } = ICONS[reason]

  return (
    <Center flex={1}>
      <Paper withBorder shadow='md' p='xl' radius='lg' w='100%' maw={420}>
        <Stack gap='md' align='center' ta='center'>
          <ThemeIcon size={56} radius='xl' variant='light' color={color}>
            <ReasonIcon size={28} stroke={1.5} />
          </ThemeIcon>
          <div>
            <Title order={3} lineClamp={2}>
              {room.title}
            </Title>
            <Text size='sm' c='dimmed'>
              {t('locked.by', { name: room.owner?.pseudo ?? t('common.unknownUser') })}
            </Text>
          </div>

          {reason === 'password' && <PasswordForm roomId={room.id} />}
          {reason === 'full' && (
            <>
              <Message>{t('locked.full', { count: room.participants, max: room.maxParticipants })}</Message>
              <Loader type='dots' />
            </>
          )}
          {reason === 'private' && <Message>{t('locked.private')}</Message>}
          {reason === 'banned' && <Message>{t('locked.banned')}</Message>}

          <Button component='a' href='#/home' variant='subtle' leftSection={<IconArrowLeft size={16} />}>
            {t('room.allRooms')}
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}

export default RoomLocked
