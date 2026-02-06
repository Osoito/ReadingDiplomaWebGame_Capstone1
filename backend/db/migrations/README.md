# knex migrations CLI commands

>Used for creating and updating any changes made to database tables

- npx knex migrate:status --> to check for any migrations

- npx knex migrate:latest --> to run all new migrations

- npx knex migrate:rollback --> to rollback last migration

- npx knex migrate:rollback migration_name_here --> to rollback a specific migration

- npm run db:make migration_name_here --> to create a new migration file (fit with the ES module)

