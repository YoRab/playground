import type React from 'react'
import { useState } from 'react'
import './Login.css'
import useLocalStorage from '@front/hooks/useLocalStorage'
import { reconnectWsClient } from '@front/hooks/useTrpc'
import { trpc } from '@front/utils/trpc'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'

const Login = () => {
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const queryClient = useQueryClient()

  const { setItem } = useLocalStorage()
  const login = trpc.public.login.useMutation({
    onSuccess: jwtToken => {
      setItem('jwt_token', jwtToken)
      const postListKey = getQueryKey(trpc.public.getMe)
      queryClient.invalidateQueries({ queryKey: postListKey })
      reconnectWsClient()
    }
  })
  const errors = error ?? login.error?.message

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pseudo.length < 2) {
      setError('Your nickname must contain at least 2 letters')
      return
    }
    setError(undefined)
    login.mutate({ pseudo })
  }

  return (
    <>
      <div className='Flex1' />
      <div className='Login'>
        <h1 className='is-size-1'>Playground</h1>
        <h2 className='is-size-3'>Play chess and other stuff</h2>
        <form onSubmit={submit}>
          <div className='field is-horizontal grid'>
            <div className='control cell'>
              <input
                className='input'
                type='text'
                name='pseudo'
                placeholder='Choose a nickname'
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
              />
            </div>
            <input type='submit' className='button is-primary cell' value='Start' />
          </div>
          {errors ? <p className='help is-danger'>{errors}</p> : null}
        </form>
      </div>
      <div className='Flex2' />
    </>
  )
}

export default Login
