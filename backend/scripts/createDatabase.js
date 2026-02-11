import pg from 'pg'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

    await client.end()

    // ensure db/migrations folder exists
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');

    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
        console.log(`Migrations folder was missing. Created folder at '../db/migrations': ${migrationsDir}`);
    }
}

createDatabase().catch((err) => {
    console.error(err)
    process.exit(1)
})