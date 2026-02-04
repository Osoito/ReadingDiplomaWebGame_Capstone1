import * as db from '../db/index.js'

const User = {
    async create({ name, passwordHash, avatar, currentlyReading, grade, role }) {
        const result = await db.query(
            `INSERT INTO users (name, password_hash, avatar, currently_reading, grade, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, avatar, currently_reading AS "currentlyReading", grade, role`,
            [name, passwordHash, avatar, currentlyReading, grade, role]
        )
        return result.rows[0]
    },

    async findByName(name) {
        // add SQL query here
        return result.rows[0] || null
    },

    async getAll() {
        // add SQL query here
        return result.rows
    }
}

// requests handled by the service layer

export default User