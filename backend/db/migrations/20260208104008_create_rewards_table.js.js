/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('rewards', function (table) {
            table.increments('id').primary()
            table.integer('owner').notNullable()
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
            table.string('reward_type').notNullable()
            table.string('reward').notNullable()
        })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('rewards')
}