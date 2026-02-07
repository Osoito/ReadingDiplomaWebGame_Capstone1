import User from '../models/user.js'
import bcrypt from 'bcrypt'

// Service layer for user related operations

const UserService = {
    async register({ name, password, avatar, currentlyReading, grade, role }) {
        const existing = await User.findByName(name)
        if (existing) {
            const err = new Error('Username already taken')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }
        try {
            const passwordHash = await bcrypt.hash(password, 10)
            return User.create({
                name,
                passwordHash,
                avatar,
                currentlyReading,
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
    }
}

// service layer functions used by controllers

export default UserService