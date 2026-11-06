import { notifications } from '@mantine/notifications'

/** Shared error toast, used by the global mutation handler and by subscriptions that report their own errors */
export const reportError = (title: string, message: string) => {
  notifications.show({ color: 'red', title, message })
}
