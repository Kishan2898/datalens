import { useCallback, useEffect, useState } from 'react'

const defaultState = {
  data: null,
  loading: true,
  error: '',
}

export const useAsyncResource = (loader, immediate = true) => {
  const [state, setState] = useState(defaultState)

  const run = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: '',
    }))

    try {
      const data = await loader()
      setState({
        data,
        loading: false,
        error: '',
      })
      return data
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to load resource.'
      setState({
        data: null,
        loading: false,
        error: message,
      })
      throw error
    }
  }, [loader])

  useEffect(() => {
    if (immediate) {
      run().catch(() => {})
    }
  }, [immediate, run])

  return {
    ...state,
    refetch: run,
  }
}
