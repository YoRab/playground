export const getPathRoute = () => {
  return window.location.hash.substring(2).split('/')?.[0]
}

export const getPathParams = () => {
  const [route, ...params] = window.location.hash.substring(2).split('/')
  return params
}
