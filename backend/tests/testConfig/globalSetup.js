import knex from 'knex'
import config from '../../knexfile.js'
import 'dotenv/config'

// Runs once when the test script or (npm vitest) is called
let initialize = false
export default async function globalSetup() {
    console.log('>>> RUNNING INTEGRATION GLOBAL SETUP <<<')
    console.log('Using DB:', config.test.connection.database)
    try {
        // Run migrations using a NEW knex instance

        const testDb = knex(config.test)
        if(!initialize){
            await testDb.migrate.rollback()
            await testDb.migrate.latest()
            await testDb.seed.run()
        }
        //await testDb('users').insert({ id:1, name: 'Test User', role: 'student', avatar: 'default.jpg' })
        await testDb.destroy()

    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}