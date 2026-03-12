import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

// automatically creates the rdiploma database and a db/migrations folder needed for the knex migrations

const { Client } = pg

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function createDatabase() {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres'
    })

    await client.connect()

    if (process.env.NODE_ENV === 'test') {
        const unitTestDbName = process.env.UNIT_TEST_DB_NAME || 'rdiplomatestunit'

        let testResult = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [unitTestDbName]
        )

        if (testResult.rowCount === 0) {
            console.log(`Database "${unitTestDbName}" does not exist. Creating...`)
            await client.query(`CREATE DATABASE ${unitTestDbName}`)
            console.log(`Database "${unitTestDbName}" created.`)
        } else {
            console.log(`Database "${unitTestDbName}" already exists.`)
        }

        const integrationTestDbName = process.env.INTEGRATION_TEST_DB_NAME || 'rdiplomatestintegration'
        testResult = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [integrationTestDbName]
        )

        if (testResult.rowCount === 0) {
            console.log(`Database "${integrationTestDbName}" does not exist. Creating...`)
            await client.query(`CREATE DATABASE ${integrationTestDbName}`)
            console.log(`Database "${integrationTestDbName}" created.`)
        } else {
            console.log(`Database "${integrationTestDbName}" already exists.`)
        }
    } else {
        const dbName = process.env.DB_NAME || 'rdiploma'

        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        )

        if (result.rowCount === 0) {
            console.log(`Database "${dbName}" does not exist. Creating...`)
            await client.query(`CREATE DATABASE ${dbName}`)
            console.log(`Database "${dbName}" created.`)
        } else {
            console.log(`Database "${dbName}" already exists.`)
        }

        // ensure db/migrations folder exists
        const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
            console.log(`Migrations folder was missing. Created folder at '../db/migrations': ${migrationsDir}`);
        }
    }

    await client.end()
}

await createDatabase().catch((err) => {
    console.error(err)
    process.exit(1)
})