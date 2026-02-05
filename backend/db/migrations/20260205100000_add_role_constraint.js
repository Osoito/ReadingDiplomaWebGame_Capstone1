/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    // Add CHECK constraint to role field
    await knex.schema.raw(`ALTER TABLE users ADD CONSTRAINT role_check CHECK (role IN ('student', 'teacher', 'principal'))`)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    // Remove CHECK constraint from role field
    await knex.schema.raw(`ALTER TABLE users DROP CONSTRAINT role_check`)
}
