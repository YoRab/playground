import { Center, Loader, Stack, Text } from '@mantine/core'
import { useTranslation } from './i18n'
import classes from './Loading.module.css'

const Loading = () => {
  const { t } = useTranslation('platform')
  return (
    <Center flex={1}>
      <Stack align='center' gap='xs' className={classes.content}>
        <Loader />
        <Text c='dimmed'>{t('loading')}</Text>
      </Stack>
    </Center>
  )
}

export default Loading
