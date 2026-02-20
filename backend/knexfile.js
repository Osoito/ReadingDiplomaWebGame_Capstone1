import 'dotenv/config'

// npx knex migrate:status --> to check for any migrations
// npx knex migrate:latest --> to run all new migrations
// npx knex migrate:rollback --> to rollback last migration
// npx knex migrate:rollback --all --> to rollback all migrations
// npm run db:make migration_name_here --> to create a new migration file (fit with the ES module)
// npm run db:seed seed_name_here --> to create a new seed file (fit with the ES module) for filling tables with data

// npx cross-env NODE_ENV=test knex migrate:rollback --all --> to rollback all migrations from test DB

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const development = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || 'rdiploma',
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
    database: process.env.TEST_DB_NAME || 'rdiplomatest',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations'
    //extension: 'js'
  },
  seeds: {
    directory: './db/seeds',
    tableName: 'knex_seeds'
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