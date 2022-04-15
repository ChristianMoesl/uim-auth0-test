import useSWR from 'swr'
import type { Consent } from '@prisma/client'
import axios from 'axios'
import { useAuth0 } from './auth0'
import { Auth0Client } from '@auth0/auth0-spa-js'

const fetcher = (client: Auth0Client) => (url: string) =>
  client.getTokenSilently().then((token) =>
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => res.data)
  )

export function useConsentsList(): {
  consents: Consent[]
  isLoading: boolean
  isError: boolean
} {
  const { state } = useAuth0()

  const { data, error } = useSWR(
    `/api/consent`,
    state.client instanceof Auth0Client
      ? fetcher(state.client)
      : () => Promise.reject('client not initialized'),
    {
      refreshInterval: 3000,
      shouldRetryOnError: true,
    }
  )

  return {
    consents: data as Consent[],
    isLoading: !error && !data,
    isError: error,
  }
}
