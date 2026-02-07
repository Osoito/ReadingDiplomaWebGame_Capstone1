/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .alterTable(
            'books', (table) => { table.unique('title')

            })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema
        .alterTable(
            'books', (table) => { table.dropUnique('title')

            })
}
