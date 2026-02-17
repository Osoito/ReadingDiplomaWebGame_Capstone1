/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('progress', function (table) {
            table.increments('id').primary()
            table.integer('level').notNullable()
            table.integer('user').notNullable()
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
            table.integer('book').notNullable()
                .unsigned()
                .references('id')
                .inTable('books')
                .onDelete('CASCADE')
            table.integer('current_page')
            table.string('level_status').notNullable()
            // Allowed fields for level_status: 'incomplete', 'complete', 'reviewed'
            table.check('level_status IN (\'incomplete\', \'complete\')')
        })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('progress')
}