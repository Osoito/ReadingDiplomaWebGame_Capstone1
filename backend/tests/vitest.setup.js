import db from '../db/db.js'

// runs before every test folder
beforeAll(async () => {
    // Creates all the necessary tables
    await db.migrate.latest()
})

// runs after every test folder
afterAll(async () => {
    // Terminates the knex connection
    await db.destroy()
})