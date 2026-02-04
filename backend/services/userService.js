import User from '../models/user.js'
const bcrypt = require('bcrypt')

// Service layer for user related operations

const UserService = {
    async register({ name, password, avatar, currentlyReading, grade, role }) {
        const existing = await User.findByName(name)
        if (existing) {
            throw new Error('Username already taken')
        }
        const passwordHash = await bcrypt.hash(password, 10)

        return User.create({
            name,
            passwordHash,
            avatar,
            currentlyReading,
            grade,
            role
        })
    },

    // add more services here
    async getAllUsers() {
        return User.getAll()
    }
}

// service layer functions used by controllers

export default UserService