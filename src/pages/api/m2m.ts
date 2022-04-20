import { NextApiRequest, NextApiResponse } from 'next'
import {
  auth,
  AuthResult,
  requiredScopes,
  UnauthorizedError,
} from 'express-oauth2-jwt-bearer'
import { PrismaClient } from '@prisma/client'
import { ObjectId } from 'bson'

const db = new PrismaClient()

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: 'https://uim-auth0-test-christianmoesl.vercel.app/',
  issuerBaseURL: `https://${process.env['NEXT_PUBLIC_AUTH0_DOMAIN']}/`,
  jwksUri: `https://${process.env['NEXT_PUBLIC_AUTH0_DOMAIN']}/.well-known/jwks.json`,
})

const checkScopes = requiredScopes('read:messages')

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // @ts-ignore
    req.is = () => false
    // Run the middleware
    await runMiddleware(req, res, checkJwt)

    const consents = await db.ping.findMany({})

    res.json(consents)
  } catch (e) {
    console.error(e)
    if (e instanceof UnauthorizedError) {
      res
        .setHeader('WWW-Authenticate', e.headers['WWW-Authenticate'])
        .status(e.status)
        .json({
          message: 'Unauthorized',
        })
    }
  }
}

async function postHandler(
  req: NextApiRequest & { auth?: AuthResult },
  res: NextApiResponse
) {
  try {
    // @ts-ignore
    req.is = () => false
    // Run the middleware
    await runMiddleware(req, res, checkJwt)

    const auth = req.auth!

    await db.ping.create({
      data: {
        id: new ObjectId().toString(),
        subject: auth.payload.sub!,
        timestamp: new Date().toUTCString(),
        userAgent: req.headers['user-agent'] ?? '',
      },
    })

    res.json({ status: 'success' })
  } catch (e) {
    console.error(e)
    if (e instanceof UnauthorizedError) {
      res
        .setHeader('WWW-Authenticate', e.headers['WWW-Authenticate'])
        .status(e.status)
        .json({
          message: 'Unauthorized',
        })
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      await getHandler(req, res)
      break
    case 'POST':
      await postHandler(req, res)
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
