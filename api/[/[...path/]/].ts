import { buildApp } from '../backend/dist/app.js'
import awsLambdaFastify from '@fastify/aws-lambda'

// Cache the Fastify -> Lambda handler across warm invocations so we don't
// rebuild the app (and reconnect Prisma) on every request.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let handlerPromise: Promise<any> | undefined

async function getHandler() {
  if (!handlerPromise) {
    const app = await buildApp()
    handlerPromise = Promise.resolve(awsLambdaFastify(app))
  }
  return handlerPromise
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = async (event: any, context: any) => {
  const handler = await getHandler()
  return handler(event, context)
}
