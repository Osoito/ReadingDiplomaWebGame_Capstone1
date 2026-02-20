import pg from 'pg'
import 'dotenv/config'

// automatically drops the rdiplomatest database after tests

const { Client } = pg

async function dropDatabase() {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres'
    })

    await client.connect()

    if (process.env.NODE_ENV === 'test') {
        const testDbName = process.env.TEST_DB_NAME || 'rdiplomatest'

        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [testDbName]
        )

        if (result.rowCount > 0) {
            console.log(`Database "${testDbName}" exists. Dropping...`)

            // Terminate active connections
            await client.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = $1
            `, [testDbName])

            // Drop the database
            await client.query(`DROP DATABASE ${testDbName}`)
            console.log(`Database "${testDbName}" dropped.`)
        } else {
            console.log(`Database "${testDbName}" does not exist.`)
        }
    }
    await client.end()
}

await dropDatabase().catch((err) => {
    console.error(err)
    process.exit(1)
})