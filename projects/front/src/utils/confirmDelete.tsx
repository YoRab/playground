import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { i18n } from '@platform/client'
import type { ReactNode } from 'react'

/** Confirmation dialog shared by every destructive action of the host (delete a room or a board, kick a user out); "Delete" by default */
export const confirmDelete = (title: string, body: ReactNode, onConfirm: () => void, confirmLabel = i18n.t('confirm.delete', { ns: 'host' })) => {
  modals.openConfirmModal({
    title,
    children: typeof body === 'string' ? <Text size='sm'>{body}</Text> : body,
    labels: { confirm: confirmLabel, cancel: i18n.t('confirm.cancel', { ns: 'host' }) },
    confirmProps: { color: 'red' },
    onConfirm
  })
}
