import '../../styles/globals.css'
import type { AppProps } from 'next/app'
import { Auth0Provider } from '../lib/auth0'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider>
      <Component {...pageProps} />
    </Auth0Provider>
  )
}

export default MyApp
