import 'dotenv/config'

// npm knex migrate:status --> to check for any migrations
// npm knex migrate:latest --> to run all new migrations
// npm knex migrate:rollback --> to rollback last migration
// npm db:make --> to create a new migration file
// npx knex migrate:rollback --all --> to rollback all migrations
// npm run db:make migration_name_here --> to create a new migration file (fit with the ES module)

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
  const development = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
    //extension: 'js'
  }
};

const staging = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },

  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
    //extension: 'js'
  }
}

const test = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
    //extension: 'js'
  }
}

const production = {
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
    //extension: 'js'
  }
}

export default {
  development, test, staging, production
};