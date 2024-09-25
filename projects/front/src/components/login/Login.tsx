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
      setError('Le pseudo doit contenir au moins 2 caractères')
      return
    }
    setError(undefined)
    login.mutate({ pseudo })
  }

  return (
    <div className='Login'>
      <div>
        <h1 className='is-size-1 has-text-white'>YoRab playground</h1>
        <h1 className='is-size-3'>YoRab playground</h1>
      </div>
      <div className='box'>
        <form onSubmit={submit}>
          <div className='field'>
            <label className='label' htmlFor='pseudo'>
              Pseudo
            </label>
            <div className='control'>
              <input className='input' id='pseudo' type='text' name='pseudo' value={pseudo} onChange={e => setPseudo(e.target.value)} />
            </div>
            {errors ? <p className='help is-danger'>{errors}</p> : null}
            <p className='help'>Aucun compte requis</p>
          </div>
          <input type='submit' className='button is-primary' />
        </form>
      </div>
    </div>
  )
}

export default Login
