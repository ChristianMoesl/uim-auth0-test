import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth0 } from '../lib/auth0'
import ConsentsList from '../components/ConsentsList'

const Home: NextPage = () => {
  const { state, login, logout } = useAuth0()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Auth0 Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://nextjs.org">
            my Auth0 test!
          </a>
        </h1>
        <div>
          {state.authenticationState === 'loggedIn' ? (
            <>
              {state.user?.picture && (
                <div className="my-8 flex flex-col items-center">
                  <img
                    className="block h-32 w-32"
                    src={state.user?.picture}
                    alt=""
                  />
                </div>
              )}
              <code className="prose-code">
                You are logged in as: {JSON.stringify(state.user, null, 2)}
              </code>
            </>
          ) : state.authenticationState === 'loggedOut' ? (
            <p className="bold my-4 text-xl">You are logged out!</p>
          ) : (
            <></>
          )}
          {state.authenticationState !== 'unknown' && (
            <>
              <div>
                <button
                  className="mb-4 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
                  disabled={state.authenticationState === 'loggedIn'}
                  onClick={login}
                >
                  Log in
                </button>
              </div>
              <div>
                <button
                  className="mb-4 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
                  disabled={state.authenticationState === 'loggedOut'}
                  onClick={logout}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
        {state.authenticationState === 'loggedIn' && (
          <div>
            <ConsentsList />
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
