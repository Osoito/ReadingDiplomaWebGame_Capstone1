export function up(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.integer('teacher_id').unsigned().nullable()
            .references('id').inTable('users').onDelete('SET NULL')

        // Drop the global unique constraint on name
        table.dropUnique(['name'])
    }).then(() => {
        // Add composite unique on (name, teacher_id)
        return knex.schema.alterTable('users', (table) => {
            table.unique(['name', 'teacher_id'])
        })
    })
}

export function down(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.dropUnique(['name', 'teacher_id'])
        table.dropForeign(['teacher_id'])
        table.dropColumn('teacher_id')
        table.unique(['name'])
    })
}
