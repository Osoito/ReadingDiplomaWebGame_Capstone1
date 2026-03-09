import db from '../../db/db.js'

export async function resetDB() {
    //await db.raw('TRUNCATE TABLE users, progress, rewards, books RESTART IDENTITY CASCADE')
    await db.migrate.rollback()
    await db.migrate.latest()
    await db.seed.run({ specific: 'users_seed.js' })
}