import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The health/route tests do not touch the database, but env validation
    // requires DATABASE_URL to be present. Provide a non-connecting placeholder
    // for the test process only.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://quizflow:quizflow@localhost:5432/quizflow_test',
    },
  },
})
