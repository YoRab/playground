import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import type { ReactNode } from 'react'

/** Confirmation dialog shared by every "Delete ..." action of the host (rooms, boards) */
export const confirmDelete = (title: string, body: ReactNode, onConfirm: () => void) => {
  modals.openConfirmModal({
    title,
    children: typeof body === 'string' ? <Text size='sm'>{body}</Text> : body,
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm
  })
}
