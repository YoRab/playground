import { VISIBILITY_ICONS } from '@front/utils/roomVisibility'
import { Button, Group, NumberInput, PasswordInput, Radio, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from '@platform/client'
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
  const { t } = useTranslation('host')
  // editing a protected room: its password is kept when the field stays empty
  const hasPassword = initialValues.visibility === 'protected'
  const form = useForm({
    mode: 'uncontrolled',
    // the NumberInput gives '' when emptied
    initialValues: { ...initialValues, maxParticipants: initialValues.maxParticipants as number | string, password: '' },
    validate: {
      title: value => (value.trim().length === 0 ? t('settings.nameRequired') : null),
      maxParticipants: (value, values) =>
        values.visibility !== 'private' && (typeof value !== 'number' || value < ROOM_LIMITS.minParticipants || value > ROOM_LIMITS.maxParticipants)
          ? t('settings.participantsRange', { min: ROOM_LIMITS.minParticipants, max: ROOM_LIMITS.maxParticipants })
          : null,
      password: (value, values) => {
        if (values.visibility !== 'protected') return null
        if (!value) return hasPassword ? null : t('settings.passwordRequired')
        return value.length < ROOM_LIMITS.passwordMin ? t('settings.passwordTooShort', { min: ROOM_LIMITS.passwordMin }) : null
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
        <TextInput label={t('settings.name')} maxLength={ROOM_LIMITS.title} data-autofocus key={form.key('title')} {...form.getInputProps('title')} />

        <Radio.Group label={t('settings.whoCanJoin')} key={form.key('visibility')} {...form.getInputProps('visibility')}>
          <SimpleGrid cols={{ base: 1, xs: 3 }} spacing='xs' mt={6}>
            {ROOM_VISIBILITIES.map(value => {
              const Icon = VISIBILITY_ICONS[value]
              return (
                <Radio.Card key={value} value={value} radius='md' className={classes.visibility}>
                  <Group gap='sm' wrap='nowrap'>
                    <Icon size={20} stroke={1.5} />
                    <div>
                      <Text fw={600} size='sm'>
                        {t(`visibility.${value}.label`)}
                      </Text>
                      <Text size='xs' c='dimmed'>
                        {t(`visibility.${value}.description`)}
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
            label={t('settings.password')}
            description={hasPassword ? t('settings.keepPassword') : t('settings.passwordHint')}
            maxLength={ROOM_LIMITS.passwordMax}
            autoComplete='new-password'
            key={form.key('password')}
            {...form.getInputProps('password')}
          />
        )}

        <NumberInput
          label={t('settings.maxParticipants')}
          description={visibility === 'private' ? t('settings.privateHint') : t('settings.youIncluded')}
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
