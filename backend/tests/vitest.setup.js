import db from '../db/db.js'

// Creates all the necessary tables
beforeAll(async () => {
    await db.migrate.latest()
    //await db.seed.run()
})

// Terminates the knex connection
afterAll(async () => {
    await db.destroy()
})