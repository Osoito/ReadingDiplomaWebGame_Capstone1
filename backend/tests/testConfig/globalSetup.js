import knex from 'knex'
import config from '../../knexfile.js'
import 'dotenv/config'

// Runs once when the test script or (npm vitest) is called
export default async function globalSetup() {
    try {
        // Run migrations using a NEW knex instance
        const testDb = knex(config.test)
        await testDb.migrate.rollback()
        await testDb.migrate.latest()
        await testDb.destroy()

    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}