/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('users', (table) => {
        table.string('avatar').nullable().alter()
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    // Ensure no NULL values exist before making the column NOT NULL
    await knex('users').whereNull('avatar').update({ avatar: '' })

    await knex.schema.alterTable('users', (table) => {
        table.string('avatar').notNullable().alter()
    })
}