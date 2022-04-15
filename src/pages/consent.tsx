import { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const Consent: NextPage = () => {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  const submit = useCallback(async () => {
    const { state, session_token } = router.query

    try {
      await axios.post('/api/consent', {
        sessionToken: session_token,
        consentGiven: checked,
      })

      router.push(
        `https://${process.env['NEXT_PUBLIC_AUTH0_DOMAIN']}/continue?state=${state}`
      )
    } catch (e) {
      alert(`failed with: ${e}`)
    }
  }, [router.isReady])

  useEffect(() => {
    if (
      router.isReady &&
      (!router.query.state || !router.query.session_token)
    ) {
      router.replace('/')
    }
  }, [router, router.isReady])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Auth0 Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <div className="form-check">
          <input
            className="form-check-input float-left mt-1 mr-2 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
            type="checkbox"
            onChange={() => setChecked(!checked)}
            checked={checked}
            id="flexCheckDefault"
          />
          <label
            className="form-check-label inline-block text-gray-800"
            htmlFor="flexCheckDefault"
          >
            Please allow me to use all your data
          </label>
        </div>
        <button
          className="mt-4 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
          disabled={!router.isReady}
          onClick={submit}
        >
          Submit
        </button>
      </main>
    </div>
  )
}

export default Consent
