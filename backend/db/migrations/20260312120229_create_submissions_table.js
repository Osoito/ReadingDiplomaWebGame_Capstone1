/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('submissions', function (table) {
            table.increments('id').primary()
            table.integer('user').notNullable()
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
            table.string('question', 255).notNullable()
            table.string('answer', 4000).notNullable()
            table.integer('completedLevel').notNullable()
                .unsigned()
                .references('id')
                .inTable('progress')
                .onDelete('CASCADE')
        })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('submissions')
}
