import knex from 'knex'
import config from '../../knexfile.js'

export const db = knex(config.test)

export async function resetDB() {
    console.log('resetDB using:', config.test.connection.database)
    await db.raw('TRUNCATE TABLE progress, rewards, books RESTART IDENTITY CASCADE')
}