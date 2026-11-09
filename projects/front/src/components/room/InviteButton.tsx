import { Button, CopyButton, Group, Popover, Text, TextInput } from '@mantine/core'
import { useTranslation } from '@platform/client'
import type { RoomVisibility } from '@platform/model'
import { IconCheck, IconCopy, IconUserPlus } from '@tabler/icons-react'

/**
 * The link of the room, to share. The copy button needs the clipboard API, only available in a secure context:
 * behind `vite --host`, a phone reaching the front through its LAN address (http) selects the link instead.
 */
const InviteButton = ({ roomId, visibility }: { roomId: string; visibility: RoomVisibility }) => {
  const { t } = useTranslation('host')
  const link = `${window.location.origin}${window.location.pathname}#/room/${roomId}`

  return (
    // trapFocus: the link is focused (so selected) on open, and Escape closes
    <Popover position='bottom-end' width={360} shadow='md' withArrow trapFocus>
      <Popover.Target>
        <Button variant='light' leftSection={<IconUserPlus size={16} />}>
          {t('invite.button')}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size='sm' fw={600}>
          {t('invite.title')}
        </Text>
        <Text size='xs' c='dimmed' mb='sm'>
          {visibility === 'protected' ? t('invite.protected') : t('invite.public')}
        </Text>
        <Group gap='xs' wrap='nowrap'>
          <TextInput value={link} readOnly flex={1} aria-label={t('invite.link')} data-autofocus onFocus={event => event.currentTarget.select()} />
          {window.isSecureContext && (
            <CopyButton value={link}>
              {({ copied, copy }) => (
                <Button
                  onClick={copy}
                  color={copied ? 'teal' : undefined}
                  leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  miw={96}
                >
                  {copied ? t('invite.copied') : t('invite.copy')}
                </Button>
              )}
            </CopyButton>
          )}
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}

export default InviteButton
