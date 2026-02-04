// Followed this guide for making this db connection
// https://node-postgres.com/guides/project-structure

// PostgreSQL downloads: https://www.postgresql.org/download/

// table creation in the schema.sql file
// npx knex init to create knexfile.js
// I can commit a template for that file, but the actual values should be filled in by each dev

const { Pool } = require('pg')
import logger from '../utils/logger'

// uses environment variables for configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'yourusername',
    password: process.env.DB_PASSWORD || 'yourpassword',
    database: process.env.DB_NAME || 'yourdatabase'
})

// logs every executed query with its duration and number of returned rows
export const query = async (text, params) => {
    const start = Date.now()
    const response = await pool.query(text, params)
    const duration = Date.now() - start
    // no query parameters logged to avoid logging sensitive information
    logger.info('executed query', { text, duration, rows: response.rowCount })
    return response
}

// for detecting client leaks (memory leaks)
export const getClient = async () => {
    const client = await pool.connect()
    const query = client.query
    const release = client.release

    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        logger.error('A client has been checked out for more than 5 seconds!')
        logger.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)

    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
        client.lastQuery = args
        return query.apply(client, args)
    }

    client.release = () => {
        // clear our timeout
        clearTimeout(timeout)
        // set the methods back to their old un-monkey-patched version
        client.query = query
        client.release = release
        return release.apply(client)
    }
    return client
}