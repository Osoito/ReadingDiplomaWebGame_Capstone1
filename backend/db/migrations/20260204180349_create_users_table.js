/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('userID').primary()
            table.string('name', 255).notNullable().unique()
            table.string('password_hash', 255).notNullable()
            table.string('avatar', 255).notNullable()
            table.integer('currently_reading', 255).notNullable()
                .unsigned()
                .references('bookID')
                .inTable('books')
                .onDelete('CASCADE')
            table.integer('grade')
            table.string('role', 255).notNullable()
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
