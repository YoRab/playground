const formatters = new Map<string, Intl.RelativeTimeFormat>()

/** One formatter per language, created on first use */
const formatterFor = (language: string) => {
  let formatter = formatters.get(language)
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
    formatters.set(language, formatter)
  }
  return formatter
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60]
]

/** "5 minutes ago", "yesterday"... in `language`; undefined under a minute ("just now", a text of the dictionaries) */
export const formatRelativeTime = (timestamp: number, now: number, language: string) => {
  const seconds = Math.round((timestamp - now) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return formatterFor(language).format(Math.round(seconds / size), unit)
  }
  return undefined
}
