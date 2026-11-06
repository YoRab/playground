import { Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import type { ReactNode } from 'react'

/** Shared "this board/room is unavailable" banner, used wherever a subscription fails */
const ErrorAlert = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <Alert color='red' title={title} icon={<IconAlertCircle />}>
      {children}
    </Alert>
  )
}

export default ErrorAlert
