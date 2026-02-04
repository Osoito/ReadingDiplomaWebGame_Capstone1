import 'dotenv/config'

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export const development = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rdiploma',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'yourpassword'
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
  },
  tableName: 'knex_migrations'
};
export const staging = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rdiploma',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'yourpassword'
  },

  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
  }
};
export const production = {
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
  }
};