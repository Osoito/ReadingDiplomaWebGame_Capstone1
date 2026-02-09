import User from '../models/user.js'
import bcrypt from 'bcrypt'

const saltRounds = 12

const UserService = {
    async register({ email, name, password, avatar, currently_reading, grade, role }) {
        const existingName = await User.findByName(name)
        if (existingName) {
            const err = new Error('Username already taken')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }
        const existingEmail = await User.findByEmail(email)
        if (existingEmail) {
            const err = new Error('Email already taken')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }
        try {
            const password_hash = await bcrypt.hash(password, saltRounds)
            return User.create({
                email,
                name,
                password_hash,
                avatar,
                currently_reading,
                grade,
                role
            })
        } catch (error) {
            const err = new Error('User registration failed')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    // add more services here
    async getAllUsers() {
        return User.getAll()
    },

    async findByName(name){
        return User.findByName(name)
    },

    async findByEmail(email){
        return User.findByEmail(email)
    },

    async findById(id){
        return User.findById(id)
    },

    async findOrCreateFederatedCredentials(profile) {
        try {
            const user = await User.findOrCreateUserFromGoogle(profile)

            if (!user.name || !user.avatar) {
                return { ...user, needsOnboarding: true }
            }

            return user

        } catch (error) {
            const err = new Error('User creation failed')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    async completeProfile({ id, name, avatar, grade }) {
        const existingName = await User.findByName(name)
        if (existingName) {
            const err = new Error('Name already taken')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }
        try {
            return await User.completeUserProfile(
                id,
                name,
                avatar,
                grade
            )
        } catch (error) {
            const err = new Error('User registration failed')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    }
}

export default UserService