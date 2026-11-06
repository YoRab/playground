import { Center, Loader, Stack, Text } from '@mantine/core'
import classes from './Loading.module.css'

const Loading = () => {
  return (
    <Center flex={1}>
      <Stack align='center' gap='xs' className={classes.content}>
        <Loader />
        <Text c='dimmed'>Chargement...</Text>
      </Stack>
    </Center>
  )
}

export default Loading
