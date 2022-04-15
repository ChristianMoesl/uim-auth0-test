import createAuth0Client, { Auth0Client, User } from '@auth0/auth0-spa-js'
import {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { createContext } from 'react'
import { useRouter } from 'next/router'
import { set } from 'es-cookie'

type Auth0State = {
  authenticationState: 'unknown' | 'loggedIn' | 'loggedOut'
  client: Auth0Client | 'unconfigured' | 'configuring'
  user?: User
}

export const defaultAuth0State: Auth0State = {
  authenticationState: 'unknown',
  client: 'unconfigured',
}

const Auth0Context = createContext({
  state: defaultAuth0State,
  setState: (_: Auth0State) => {},
})

export const Auth0Provider = (props: PropsWithChildren<{}>) => {
  const [state, setState] = useState(defaultAuth0State)

  return (
    <Auth0Context.Provider value={{ state, setState }}>
      {props.children}
    </Auth0Context.Provider>
  )
}

async function updateAuthenticationState(
  state: Auth0State,
  setState: (state: Auth0State) => void
): Promise<void> {
  try {
    if (state.client instanceof Auth0Client) {
      const isAuthenticated = await state.client.isAuthenticated()

      setState({
        ...state,
        user: await state.client.getUser(),
        authenticationState: isAuthenticated ? 'loggedIn' : 'loggedOut',
      })
    }
  } catch {
    setState({ ...state, user: undefined, authenticationState: 'loggedOut' })
  }
}

export function useAuth0() {
  const { state, setState } = useContext(Auth0Context)
  const router = useRouter()

  useEffect(() => {
    if (state.client === 'unconfigured') {
      setState({
        ...state,
        client: 'configuring',
      })

      createAuth0Client({
        domain: process.env['NEXT_PUBLIC_DOMAIN']!,
        client_id: process.env['NEXT_PUBLIC_CLIENT_ID']!,
        audience: 'https://uim-auth0-test-christianmoesl.vercel.app/',
      })
        .then((client) => {
          updateAuthenticationState({ ...state, client }, setState)
          return client
        })
        .catch((e) => {
          console.error(e)
          setState({
            client: 'unconfigured',
            user: undefined,
            authenticationState: 'unknown',
          })
        })
    }
  }, [state.client, setState])

  const login = useCallback(async () => {
    if (state.client instanceof Auth0Client) {
      await state.client.loginWithRedirect({
        redirect_uri: window.location.origin,
      })
    }
  }, [state.client])

  const logout = useCallback(async () => {
    if (state.client instanceof Auth0Client) {
      await state.client?.logout({
        returnTo: window.location.origin,
      })
    }
  }, [state.client])

  useEffect(() => {
    if (
      router.isReady &&
      state.client instanceof Auth0Client &&
      router.query.code &&
      router.query.state
    ) {
      // Process the login state
      state.client
        .handleRedirectCallback()
        .then(async () => {
          await updateAuthenticationState(state, setState)

          // Use replaceState to redirect the user away and remove the querystring parameters
          router.replace('/')
        })
        .catch((e) => {
          console.error(e)
        })
    }
  }, [router.isReady, router.query.code, router.query.state, state.client])

  return { state, login, logout }
}
