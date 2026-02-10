/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('federated_credentials', function (table) {
            table.increments('id').primary()
            table.integer('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')

            table.string('provider').notNullable()   // 'google'
            table.string('provider_user_id').notNullable() // Google profile.id

            table.unique('provider_user_id')
        })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('federated_credentials')
}