/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('progress', (table) => {
        table.integer('book').nullable().alter()
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (/*knex*/) => {
    //breaks test database during progress integration tests
    /*
    await knex.schema.alterTable('progress', (table) => {
        table.integer('book').notNullable().alter()
    })
    */
}
