import React, { useCallback, useRef, useState } from 'react'
import './paint.css'
import { trpc } from '@front/utils/trpc'
import ReactPaint from '@yorab/react-paint'

type AnnotationsType = ReturnType<NonNullable<NonNullable<Parameters<typeof ReactPaint>[0]['apiRef']>['current']>['getCurrentData']>['shapes']

const Paint = () => {
	const apiRef: Parameters<typeof ReactPaint>[0]['apiRef'] = useRef()
	const [shapes, setShapes] = useState<AnnotationsType>(undefined)
	const tempShapes = useRef<string | undefined>('[]')
	const [error, setError] = useState<string | undefined>()

	const userQuery = trpc.public.getMe.useQuery()
	const user = userQuery.data

	trpc.public.onGetPaint.useSubscription(undefined, {
		onData(data) {
			console.log('received dataaaa !')
			if (JSON.stringify(data) === tempShapes.current) {
				return
			}
			setShapes(data as AnnotationsType)
		},
		onError(err) {
			console.error('Subscription error:', err)
			setError(err.message)
		}
	})

	const setPaintMutation = trpc.public.setPaint.useMutation()

	const saveAnnotation = useCallback(() => {
		if (!apiRef.current) return
		const drawData = apiRef.current.getCurrentData()
		const newData = JSON.stringify(drawData.shapes)
		if (tempShapes.current === newData) return
		tempShapes.current = newData
		setPaintMutation.mutate({ value: drawData.shapes })
	}, [setPaintMutation])

	return (
		<div className='ScreenPaint'>
			<a href='#/home'>Retour</a>
			{error ?? <ReactPaint width={1280} height={720} shapes={shapes} onDataChanged={saveAnnotation} apiRef={apiRef} />}
		</div>
	)
}

export default Paint
