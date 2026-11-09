import { ActionIcon, Menu } from '@mantine/core'
import { LANGUAGES, type Language, setLanguage, useLanguage, useTranslation } from '@platform/client'
import { IconCheck, IconLanguage } from '@tabler/icons-react'

const OPTIONS = Object.entries(LANGUAGES) as [Language, string][]

/** The language of the interface, remembered by this browser; each language is named in itself */
const LanguageMenu = () => {
  const { t } = useTranslation('host')
  const language = useLanguage()

  return (
    <Menu position='bottom-end' width={160}>
      <Menu.Target>
        <ActionIcon variant='default' size='lg' aria-label={t('toolbar.language')}>
          <IconLanguage size={18} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {OPTIONS.map(([code, name]) => (
          <Menu.Item key={code} lang={code} rightSection={language === code ? <IconCheck size={14} /> : null} onClick={() => setLanguage(code)}>
            {name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}

export default LanguageMenu
