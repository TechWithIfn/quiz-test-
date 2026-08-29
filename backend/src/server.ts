import { buildApp } from './app.js'
import { env } from './config/env.js'
import { disconnectDb } from './db/client.js'

async function start(): Promise<void> {
  const app = await buildApp()

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`Received ${signal}, shutting down...`)
    await app.close()
    await disconnectDb()
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    app.log.info(`QuizFlow API listening on port ${env.PORT}`)
  } catch (error) {
    app.log.error(error)
    await disconnectDb()
    process.exit(1)
  }
}

void start()
