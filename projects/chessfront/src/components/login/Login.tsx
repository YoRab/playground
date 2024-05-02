import React, { useEffect, useState } from 'react';
import './Login.css'
import { trpc } from '../../utils/trpc';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

const Login = () => {
    const [pseudo, setPseudo] = useState("")
    const [error, setError] = useState<string | undefined>(undefined)
    const queryClient = useQueryClient()

    const { setItem } = useLocalStorage()
    const login = trpc.public.login.useMutation({
        onSuccess: (jwtToken) => {
            setItem('jwt_token', jwtToken)
            const postListKey = getQueryKey(trpc.public.getMe);
            queryClient.invalidateQueries({ queryKey: postListKey })
        }
    })
    const errors = error ?? login.error?.message

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (pseudo.length < 2) {
            setError("Le pseudo doit contenir au moins 2 caractères")
            return
        }
        setError(undefined)
        login.mutate({ pseudo })
    }

    return (
        <div className='Login'>
            <div>
                <img src="./vite.svg" alt="logo" />
                <h1>ChessFront</h1>
            </div>
            <div>
                <form onSubmit={submit}>
                    <input placeholder="mon pseudo" type="text" name="pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} />
                    <input type="submit" />
                    {errors ? <span>{errors}</span> : null}

                </form>
            </div>
        </div>
    )
}

export default Login
