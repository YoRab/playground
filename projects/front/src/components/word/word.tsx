import React, { FormEvent, useRef, useState } from 'react'
import './word.css'
import { trpc } from '@front/utils/trpc'

const Word = () => {
	const contentEditableRef = useRef<HTMLDivElement>(null)
	const [error, setError] = useState<string | undefined>()

	const userQuery = trpc.public.getMe.useQuery()
	const user = userQuery.data

	trpc.public.onGetWord.useSubscription(undefined, {
		onData(data) {
			console.log('received dataaaa !')
			// setWord(data)
			console.log(contentEditableRef.current?.textContent)
			if (!contentEditableRef.current) return
			if (contentEditableRef.current.textContent !== data) {
				contentEditableRef.current.textContent = data
			}
		},
		onError(err) {
			console.error('Subscription error:', err)
			setError(err.message)
		}
	})

	const setWordMutation = trpc.public.setWord.useMutation()

	const onChangeWord = (e: FormEvent<HTMLElement>) => {
		setWordMutation.mutate({ value: (e.target as HTMLElement).textContent ?? '' })
	}
	return (
		<div className='ScreenWord'>
			<a href='#/home'>Retour</a>
			{error ?? <div ref={contentEditableRef} className='WordContent' contentEditable onInput={onChangeWord} />}
		</div>
	)
}

export default Word
