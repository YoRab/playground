import { trpc } from '@front/utils/trpc'
import { Button, Divider, Group, Modal, Stack, Text, Title } from '@mantine/core'
import { UserAvatar, useTranslation } from '@platform/client'
import type { Room } from '@platform/model'
import { IconUserCheck } from '@tabler/icons-react'
import RoomSettingsForm from './RoomSettingsForm'

/** The users the owner kicked out, to let them in again */
const BannedUsers = ({ room }: { room: Room }) => {
  const { t } = useTranslation('host')
  const unban = trpc.protected.unbanUser.useMutation()
  const banned = room.banned ?? []

  return (
    <Stack gap='xs'>
      <Title order={5}>{t('settings.banned')}</Title>
      {banned.length === 0 ? (
        <Text size='sm' c='dimmed'>
          {t('settings.noBanned')}
        </Text>
      ) : (
        banned.map(user => (
          <Group key={user.id} justify='space-between' wrap='nowrap'>
            <Group gap='xs' wrap='nowrap' miw={0}>
              <UserAvatar user={{ id: user.id, name: user.pseudo }} size='sm' />
              <Text size='sm' truncate>
                {user.pseudo}
              </Text>
            </Group>
            <Button
              size='xs'
              variant='light'
              leftSection={<IconUserCheck size={14} />}
              loading={unban.isPending && unban.variables?.userId === user.id}
              onClick={() => unban.mutate({ roomId: room.id, userId: user.id })}
            >
              {t('settings.letBackIn')}
            </Button>
          </Group>
        ))
      )}
    </Stack>
  )
}

/** The owner changes the settings of the room (applied live to everyone in it) and lifts the bans */
const RoomSettingsModal = ({ room, opened, onClose }: { room: Room; opened: boolean; onClose: () => void }) => {
  const { t } = useTranslation('host')
  const update = trpc.protected.updateRoom.useMutation({ onSuccess: onClose })

  return (
    <Modal opened={opened} onClose={onClose} title={t('room.settings')} size='lg'>
      {/* the content is unmounted when the modal closes: the form starts from the current settings every time */}
      <RoomSettingsForm
        initialValues={{ title: room.title, visibility: room.visibility, maxParticipants: room.maxParticipants }}
        submitLabel={t('settings.save')}
        loading={update.isPending}
        onSubmit={values => update.mutate({ roomId: room.id, ...values })}
      />
      <Divider my='lg' />
      <BannedUsers room={room} />
    </Modal>
  )
}

export default RoomSettingsModal
