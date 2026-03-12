/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema.alterTable('progress', (table) => {
        table.renameColumn('current_page', 'current_progress')
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.alterTable('progress', (table) => {
        table.renameColumn('current_progress', 'current_page')
    })
}
