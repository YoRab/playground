import { Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { errorMessage, type ServerError, useTranslation } from './i18n'

/** Shared "this board/room is unavailable" banner, used wherever a subscription fails: the error in the language of the interface, titled "Board unavailable" by default */
const ErrorAlert = ({ title, error }: { title?: string; error: ServerError }) => {
  const { t } = useTranslation('platform')
  return (
    <Alert color='red' title={title ?? t('boardUnavailable')} icon={<IconAlertCircle />}>
      {errorMessage(error)}
    </Alert>
  )
}

export default ErrorAlert
