

import React, { useCallback } from "react";

const useLocalStorage = () => {
    const getItem = useCallback((key: string) => {
        try {
            const value = localStorage.getItem(key)
            return value !== null ? JSON.parse(value) : null
        } catch (error) {
            return null
        }
    }, [])

    const setItem = useCallback((key: string, value: string | null) => {
        value === null ?
            localStorage.removeItem(key) :
            localStorage.setItem(key, value);
    }, [])

    return { getItem, setItem }
}

export default useLocalStorage;