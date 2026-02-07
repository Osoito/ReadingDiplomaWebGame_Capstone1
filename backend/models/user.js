import * as db from '../db/index.js'

const User = {
    async create({ name, passwordHash, avatar, currentlyReading, grade, role }) {
        /*
        const result = await db.query(
            `INSERT INTO users (name, password_hash, avatar, currently_reading, grade, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, avatar, currently_reading AS "currentlyReading", grade, role`,
            [name, passwordHash, avatar, currentlyReading, grade, role]
        )
        return result.rows[0]
        */
        return db('users')
            .insert({ name, passwordHash, avatar, currentlyReading, grade, role })
            .returning('*')
    },

    async findByName(name) {
        /*
        // add SQL query here
        const result = await db.query(
            'SELECT name, avatar, currently_reading, grade, role FROM users WHERE name = $1',
            [name]
        )
        return result.rows[0] || null
        */
        return db('users')
            .select('name', 'password_hash', 'avatar', 'currently_reading, grade, role')
            .where({ name })
            .first()
    },

    async getAll() {
        /*
        // add SQL query here
        const result = await db.query(
            'SELECT name, avatar, currently_reading, grade, role FROM users WHERE role = "student"'
        )
        return result.rows
        */
        return db('users')
            .select('*')
    }
}

// requests handled by the service layer

export default User