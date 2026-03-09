import 'dotenv/config'
import db from '../../db/db.js'
// Runs once when the test script or (npm vitest) is called
export default async function globalSetup() {
    try {
        // Run migrations using a NEW knex instance
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run({ specific: 'users_seed.js' })
        //await testDb('users').insert({ id:1, name: 'Test User', role: 'student', avatar: 'default.jpg' })

    } finally{
        await db.destroy()
    }
}