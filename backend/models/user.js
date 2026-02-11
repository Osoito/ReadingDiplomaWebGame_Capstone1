import db from '../db/db.js'

const User = {
    async create({ email, name, password_hash, avatar, currently_reading, grade, role }) {
        return db('users')
            .insert({ email, name, password_hash, avatar, currently_reading, grade, role })
            .returning('*')
    },

    async findByName(name) {
        return db('users')
            .select('id', 'email', 'name', 'password_hash', 'avatar', 'currently_reading', 'grade', 'role')
            .where({ name })
            .first()
    },
    async findByEmail(email) {
        return db('users')
            .select('id', 'email', 'name', 'password_hash', 'avatar', 'currently_reading', 'grade', 'role')
            .where({ email })
            .first()
    },
    async findUserById(id) {
        // Removed the password_hash from here
        return db('users')
            .select('id', 'email', 'name', 'avatar', 'currently_reading', 'grade', 'role')
            .where({ id })
            .first()
    },
    async getAll() {
        return db('users')
            .select('id', 'email', 'name', 'avatar', 'currently_reading', 'grade', 'role')
    },

    async updateUserRole(id, role) {
        if(role === 'student'){
            role = 'teacher'
        } else if(role === 'teacher'){
            role = 'student'
        }
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

            // Searches for the profile picture used in the google account, which will be set as default avatar if found
            const avatar = profile.photos?.[0]?.value
                ? `${profile.photos[0].value}?sz=200`
                : ''
            // If federated account doesn't exist, create new user with empty details
            const [user] = await trx('users')
                .insert({
                    email: profile.emails?.[0].value ?? null,
                    name: '',
                    avatar: avatar,
                    role: 'student',
                    grade: 1,
                    currently_reading: null
                })
                .returning('*')

            if (!user) throw new Error('User creation failed')

            // Create federated credentials and associate the created user to it
            await trx('federated_credentials').insert({
                user_id: user.id,
                provider,
                provider_user_id: providerUserId
            })
            return user
        })
    },

    async completeUserProfile(id, name, avatar, grade) {
        return db('users')
            .where({ id })
            .update({
                name: name,
                avatar: avatar,
                grade: grade
            })
            .returning('*')
    }
}

export default User