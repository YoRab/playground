import { VISIBILITIES } from '@front/utils/roomVisibility'
import { Button, Group, NumberInput, PasswordInput, Radio, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { ROOM_LIMITS, ROOM_VISIBILITIES, type RoomVisibility } from '@platform/model'
import classes from './RoomSettingsForm.module.css'

/** What the form gives: `password` only when a new one was typed for a protected room */
export type RoomSettingsValues = {
  title: string
  visibility: RoomVisibility
  maxParticipants: number
  password?: string | undefined
}

type RoomSettingsFormProps = {
  initialValues: Omit<RoomSettingsValues, 'password'>
  submitLabel: string
  loading: boolean
  onSubmit: (values: RoomSettingsValues) => void
}

/** The settings of a room: when creating it (home page), and when its owner changes them (room header) */
const RoomSettingsForm = ({ initialValues, submitLabel, loading, onSubmit }: RoomSettingsFormProps) => {
  // editing a protected room: its password is kept when the field stays empty
  const hasPassword = initialValues.visibility === 'protected'
  const form = useForm({
    mode: 'uncontrolled',
    // the NumberInput gives '' when emptied
    initialValues: { ...initialValues, maxParticipants: initialValues.maxParticipants as number | string, password: '' },
    validate: {
      title: value => (value.trim().length === 0 ? 'Give the room a name' : null),
      maxParticipants: (value, values) =>
        values.visibility !== 'private' && (typeof value !== 'number' || value < ROOM_LIMITS.minParticipants || value > ROOM_LIMITS.maxParticipants)
          ? `Between ${ROOM_LIMITS.minParticipants} and ${ROOM_LIMITS.maxParticipants}`
          : null,
      password: (value, values) => {
        if (values.visibility !== 'protected') return null
        if (!value) return hasPassword ? null : 'A protected room needs a password'
        return value.length < ROOM_LIMITS.passwordMin ? `At least ${ROOM_LIMITS.passwordMin} characters` : null
      }
    }
  })
  const visibility = form.useWatchValue('visibility')

  const submit = form.onSubmit(({ title, visibility, maxParticipants, password }) => {
    onSubmit({
      title: title.trim(),
      visibility,
      // a private room keeps its limit for when it opens again
      maxParticipants: typeof maxParticipants === 'number' ? maxParticipants : initialValues.maxParticipants,
      password: password || undefined
    })
  })

  return (
    <form onSubmit={submit}>
      <Stack gap='md'>
        <TextInput label='Name' maxLength={ROOM_LIMITS.title} data-autofocus key={form.key('title')} {...form.getInputProps('title')} />

        <Radio.Group label='Who can join' key={form.key('visibility')} {...form.getInputProps('visibility')}>
          <SimpleGrid cols={{ base: 1, xs: 3 }} spacing='xs' mt={6}>
            {ROOM_VISIBILITIES.map(value => {
              const { label, description, icon: Icon } = VISIBILITIES[value]
              return (
                <Radio.Card key={value} value={value} radius='md' className={classes.visibility}>
                  <Group gap='sm' wrap='nowrap'>
                    <Icon size={20} stroke={1.5} />
                    <div>
                      <Text fw={600} size='sm'>
                        {label}
                      </Text>
                      <Text size='xs' c='dimmed'>
                        {description}
                      </Text>
                    </div>
                  </Group>
                </Radio.Card>
              )
            })}
          </SimpleGrid>
        </Radio.Group>

        {visibility === 'protected' && (
          <PasswordInput
            label='Password'
            description={hasPassword ? 'Leave empty to keep the current password' : 'Whoever joins the room types it once'}
            maxLength={ROOM_LIMITS.passwordMax}
            autoComplete='new-password'
            key={form.key('password')}
            {...form.getInputProps('password')}
          />
        )}

        <NumberInput
          label='Max participants'
          description={visibility === 'private' ? 'Only you can enter a private room' : 'You included'}
          min={ROOM_LIMITS.minParticipants}
          max={ROOM_LIMITS.maxParticipants}
          allowDecimal={false}
          allowNegative={false}
          disabled={visibility === 'private'}
          w={{ base: '100%', xs: 200 }}
          key={form.key('maxParticipants')}
          {...form.getInputProps('maxParticipants')}
        />

        <Group justify='flex-end' mt='xs'>
          <Button type='submit' loading={loading}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

export default RoomSettingsForm
