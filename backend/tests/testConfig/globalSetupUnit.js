import knex from 'knex'
import config from '../../knexfile.js'

export default async function setupUnit() {
    const db = knex(config.test_Unit)

    await db.migrate.rollback({}, true)
    await db.migrate.latest()

    await db.destroy()
}
