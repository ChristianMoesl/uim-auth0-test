const axios = require('axios')

const env = (key) => process.env[key]

const resourceServer =
  env('RESOURCE_SERVER') ?? 'https://uim-auth0-test-christianmoesl.vercel.app/'

async function fetchAccessToken() {
  console.log(
    'Fetching access token from https://dev-2vghwxtc.eu.auth0.com/oauth/token'
  )

  const { data } = await axios.post(
    'https://dev-2vghwxtc.eu.auth0.com/oauth/token',
    {
      audience: resourceServer,
      grant_type: 'client_credentials',
      client_id: env('AUTH0_CLIENT_ID'),
      client_secret: env('AUTH0_CLIENT_SECRET'),
    },
    {
      'cache-control': 'no-cache',
    }
  )

  return data.access_token
}

async function ping(accessToken) {
  await axios.post(
    resourceServer + '/api/m2m',
    {
      message: 'ping from a machine',
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  console.log(
    `successfully pinged the resourceServer on: ${resourceServer}pi/m2m`
  )
}

async function main() {
  const accessToken = await fetchAccessToken()

  ping(accessToken)

  const task = () =>
    setTimeout(() => ping(accessToken).then(() => task()), 3000)

  await task()
}

main()
