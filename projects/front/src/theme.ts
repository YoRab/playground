import { Badge, Card, createTheme, Modal, Tooltip } from '@mantine/core'

const TEXT_FONT = "'Inter Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
/** Titles and the name of the app (also used by the CSS modules through --mantine-font-family-headings) */
const HEADINGS_FONT = `'Outfit Variable', ${TEXT_FONT}`

export const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: 'md',
  fontFamily: TEXT_FONT,
  headings: { fontFamily: HEADINGS_FONT, fontWeight: '700' },
  // softer than Mantine's: on the tinted background of the app, the borders already separate the surfaces
  shadows: {
    xs: '0 1px 2px rgb(15 15 30 / 6%)',
    sm: '0 1px 3px rgb(15 15 30 / 8%), 0 1px 2px rgb(15 15 30 / 4%)',
    md: '0 4px 12px rgb(15 15 30 / 8%), 0 2px 4px rgb(15 15 30 / 4%)',
    lg: '0 10px 24px rgb(15 15 30 / 10%), 0 4px 8px rgb(15 15 30 / 4%)',
    xl: '0 20px 40px rgb(15 15 30 / 12%), 0 8px 16px rgb(15 15 30 / 6%)'
  },
  components: {
    Badge: Badge.extend({ defaultProps: { variant: 'light' } }),
    Card: Card.extend({ defaultProps: { withBorder: true, radius: 'lg', padding: 'lg' } }),
    Modal: Modal.extend({ defaultProps: { centered: true, radius: 'lg', overlayProps: { blur: 3, backgroundOpacity: 0.4 } } }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true } })
  }
})
