import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import type { ReactNode } from 'react'

/** Confirmation dialog shared by every destructive action of the host (delete a room or a board, kick a user out) */
export const confirmDelete = (title: string, body: ReactNode, onConfirm: () => void, confirmLabel = 'Delete') => {
  modals.openConfirmModal({
    title,
    children: typeof body === 'string' ? <Text size='sm'>{body}</Text> : body,
    labels: { confirm: confirmLabel, cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm
  })
}
