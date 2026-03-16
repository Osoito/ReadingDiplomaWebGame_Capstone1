/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema.alterTable('submissions', (table) => {
        table.string('question2').notNullable()
        table.string('answer2').notNullable()
        table.string('question3').notNullable()
        table.string('answer3').notNullable()
        table.renameColumn('question', 'question1')
        table.renameColumn('answer', 'answer1')
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.alterTable('submissions', (table) => {
        table.dropColumn('question2')
        table.dropColumn('answer2')
        table.dropColumn('question3')
        table.dropColumn('answer3')
        table.renameColumn('question1', 'question')
        table.renameColumn('answer1', 'answer')
    })
}
