// This file runs before every test file in the same process. By default, all test files run in parallel
import db from '../../db/db.js'
import { beforeAll, afterAll } from 'vitest'

// runs before each test file
beforeAll(async () => {
    // Creates all the necessary tables
    await db.migrate.latest()
    //await db.seed.run()
})

// runs after each test file
afterAll(async () => {
    // Terminates the knex connection
    await db.destroy()
})