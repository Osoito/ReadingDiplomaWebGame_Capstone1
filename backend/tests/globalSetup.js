import knex from 'knex'
import config from '../knexfile.js'
import 'dotenv/config'

export default async function globalSetup() {
    try {
        // Run migrations using a NEW knex instance
        const testDb = knex(config.test)
        await testDb.migrate.latest()
        await testDb.destroy()

    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}