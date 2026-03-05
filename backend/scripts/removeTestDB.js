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
        const unitTestDbName = process.env.UNIT_TEST_DB_NAME || 'rdiplomatestunit'

        let result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [unitTestDbName]
        )

        if (result.rowCount > 0) {
            console.log(`Database "${unitTestDbName}" exists. Dropping...`)

            // Terminate active connections
            await client.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = $1
            `, [unitTestDbName])

            // Drop the database
            await client.query(`DROP DATABASE ${unitTestDbName}`)
            console.log(`Database "${unitTestDbName}" dropped.`)
        } else {
            console.log(`Database "${unitTestDbName}" does not exist.`)
        }

        const integrationTestDbName = process.env.INTEGRATION_TEST_DB_NAME || 'rdiplomatestintegration'

        result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [integrationTestDbName]
        )

        if (result.rowCount > 0) {
            console.log(`Database "${integrationTestDbName}" exists. Dropping...`)

            // Terminate active connections
            await client.query(`
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = $1
            `, [integrationTestDbName])

            // Drop the database
            await client.query(`DROP DATABASE ${integrationTestDbName}`)
            console.log(`Database "${integrationTestDbName}" dropped.`)
        } else {
            console.log(`Database "${integrationTestDbName}" does not exist.`)
        }
    }
    await client.end()
}

await dropDatabase().catch((err) => {
    console.error(err)
    process.exit(1)
})