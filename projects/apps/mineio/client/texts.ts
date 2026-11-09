import { useLanguage, useTranslation } from '@platform/client'
import type { LobbySeat } from '../server/types'

/** The keys of the corners in the dictionaries, in the order of the corners of the library (`SEAT_LABELS`) */
export const SEAT_KEYS = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const

// building a formatter costs much more than using one, and the density slider formats its label at every move
const percentFormats = new Map<string, Intl.NumberFormat>()

const percentFormat = (language: string, fractionDigits: number) => {
  const key = `${language}:${fractionDigits}`
  let format = percentFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat(language, { style: 'percent', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
    percentFormats.set(key, format)
  }
  return format
}

/** Formats a ratio (0.125) as a percentage in the language of the interface: "12.5%", "12,5 %" */
export const usePercent = () => {
  const language = useLanguage()
  return (ratio: number, fractionDigits = 0) => percentFormat(language, fractionDigits).format(ratio)
}

/** The name of a corner's player: a bot is named after its level, in the language of the interface (the server names it in English) */
export const useSeatName = () => {
  const { t } = useTranslation('mineio')
  return (entry: LobbySeat | null | undefined) => (entry?.kind === 'bot' ? t(`bots.${entry.level}`) : entry?.name)
}
