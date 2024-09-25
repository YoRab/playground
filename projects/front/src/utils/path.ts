export const getPathRoute = () => {
  return window.location.hash.substring(2).split('/')?.[0]
}

export const getPathParams = () => {
  const [_route, ...params] = window.location.hash.substring(2).split('/')
  return params
}
