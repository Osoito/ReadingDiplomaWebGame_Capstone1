<<<<<<< HEAD
// Update with your config settings.

import "dotenv/config"
=======
// The following command runs any missing migrations inside the db/migrations folder:
// npx knex migrate:latest 

// the knex_migrations table is created automatically to keep track of the applied migrations

import 'dotenv/config'
>>>>>>> 1f9c322d22265e093b51351361a8df3d78dfe0c2

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
<<<<<<< HEAD


  export const development = {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    }
  }

   export const staging = {
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
    }
  }

  export const production =  {
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
  }


=======
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
>>>>>>> 1f9c322d22265e093b51351361a8df3d78dfe0c2
