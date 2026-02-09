import db from '../db/db.js'

const User = {
    async create({ email, name,  password_hash, avatar, currently_reading, grade, role }) {
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
            .insert({ email, name, password_hash, avatar, currently_reading, grade, role })
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
            .select('email', 'name', 'password_hash', 'avatar', 'currently_reading', 'grade', 'role')
            .where({ name })
            .first()
    },
    async findByEmail(email) {
        /*
        // add SQL query here
        const result = await db.query(
            'SELECT name, avatar, currently_reading, grade, role FROM users WHERE name = $1',
            [name]
        )
        return result.rows[0] || null
        */
        return db('users')
            .select('email', 'name', 'password_hash', 'avatar', 'currently_reading', 'grade', 'role')
            .where({ email })
            .first()
    },
    async findById(id){
        return db('users')
            .select('email', 'name', 'password_hash', 'avatar', 'currently_reading', 'grade', 'role')
            .where({ id })
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
    },

    async updateUserRole( id, role){
        return db('users')
            .where({ id })
            .update({ role: role })
            .returning('*')
    },

    async findOrCreateUserFromGoogle(profile) {
        return db.transaction(async trx => {
            const provider = 'google'
            const providerUserId = profile.id

            // Check if federated account already exists
            const existing = await trx('federated_credentials')
                .where({ provider, provider_user_id: providerUserId })
                .first()

            // If federated account exists, return the associated user
            if (existing) {
                return trx('users')
                    .where({ id: existing.user_id })
                    .first()
            }

            // If federated account doesn't exist, create new user with empty details
            const [user] = await trx('users')
                .insert({
                    email: profile.emails?.[0].value ?? null,
                    name: '',
                    avatar: '',
                    role: 'student',
                    grade: 1,
                    currently_reading: null
                })
                .returning('*')

            // Create federated credentials and associate the created user to it
            await trx('federated_credentials').insert({
                user_id: user.id,
                provider,
                provider_user_id: providerUserId
            })
        })
    }
}

// requests handled by the service layer

export default User