/** Texts of the Paint app (namespace `paint`, its type): the reference dictionary */
const en = {
  label: 'Paint',
  description: "A shared canvas: draw together and see everyone's pointer"
}

export default en

declare module '@platform/client/i18n' {
  interface Namespaces {
    paint: typeof en
  }
}
