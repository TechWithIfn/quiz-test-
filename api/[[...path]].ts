import { buildApp } from '../../backend/dist/app.js'
import awsLambdaFastify from '@fastify/aws-lambda'

let handlerPromise
async function getHandler() {
  if (!handlerPromise) {
    const app = await buildApp()
    handlerPromise = Promise.resolve(awsLambdaFastify(app))
  }
  return handlerPromise
}

export const handler = async (event, context) => {
  const handler = await getHandler()
  return handler(event, context)
}
