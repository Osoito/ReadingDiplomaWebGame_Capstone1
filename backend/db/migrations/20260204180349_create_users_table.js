/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id').primary()
            table.string('email').unique().nullable()
            table.string('name').unique().notNullable()
            table.string('password_hash', 255).nullable()
            table.string('avatar').notNullable() // Might need to have a default value
            table.integer('currently_reading').nullable()
                .unsigned()
                .references('id')
                .inTable('books')
                .onDelete('CASCADE')
            table.integer('grade').notNullable().defaultTo(1)
            table.string('role').notNullable().defaultTo('student')
            // Only allows the role field to have these values: 'student', 'teacher', 'principal'
            table.check('role IN (\'student\', \'teacher\', \'principal\')')
        })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('users')
}
