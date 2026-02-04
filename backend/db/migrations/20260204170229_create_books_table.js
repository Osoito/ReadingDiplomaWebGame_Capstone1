
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('books', function (table) {
            table.increments('bookID').primary()
            table.string('title', 255).notNullable()
            table.string('author', 255).notNullable()
            table.string('coverimage', 255).notNullable()
            table.string('booktype', 255).notNullable()
        })
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('books')
}
