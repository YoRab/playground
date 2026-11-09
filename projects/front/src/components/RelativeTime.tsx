import { formatRelativeTime } from '@front/utils/relativeTime'
import { useInterval } from '@mantine/hooks'
import { useLanguage, useTranslation } from '@platform/client'
import { useState } from 'react'

/** "5 minutes ago", refreshed every minute: the clock lives here, so only this text re-renders */
const RelativeTime = ({ timestamp }: { timestamp: number }) => {
  const { t } = useTranslation('host')
  const language = useLanguage()
  const [now, setNow] = useState(Date.now)
  useInterval(() => setNow(Date.now()), 60_000, { autoInvoke: true })
  return <>{formatRelativeTime(timestamp, now, language) ?? t('time.justNow')}</>
}

export default RelativeTime
