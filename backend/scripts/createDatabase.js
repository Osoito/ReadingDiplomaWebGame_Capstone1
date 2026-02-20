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
        database: 'postgres'
    })

    await client.connect()

    if (process.env.NODE_ENV === 'test') {
        const testDbName = process.env.TEST_DB_NAME

        const testResult = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [testDbName]
        )

        if (testResult.rowCount === 0) {
            console.log(`Database "${testDbName}" does not exist. Creating...`)
            await client.query(`CREATE DATABASE ${testDbName}`)
            console.log(`Database "${testDbName}" created.`)
        } else {
            console.log(`Database "${testDbName}" already exists.`)
        }
    } else {
        const dbName = process.env.DB_NAME

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

createDatabase().catch((err) => {
    console.error(err)
    process.exit(1)
})