import User from '../models/user.js'
import bcrypt from 'bcrypt'

const saltRounds = 12

const UserService = {
    async register({ email, name, password, avatar, currently_reading, grade, role }) {
        const existingName = await User.findByName(name)
        if (existingName) {
            const err = new Error('Username already taken')
            err.status = 400
            throw err
        }
        const existingEmail = await User.findByEmail(email)
        if (existingEmail) {
            const err = new Error('Email already taken')
            err.status = 400
            throw err
        }
        const password_hash = await bcrypt.hash(password, saltRounds)
        if (!grade) {
            grade = 1
        }
        if (!role) {
            role = 'student'
        }
        return User.create({
            email,
            name,
            password_hash,
            avatar,
            currently_reading,
            grade,
            role
        })
    },

    async getAllUsers() {
        const users = await User.getAll()
        if (!users) {
            const err = new Error('No users found')
            err.status = 404
            throw err
        }
        return users
        // This could include role based filtering
    },

    async findByName(name) {
        const user = await User.findByName(name)
        if (!user) {
            const err = new Error('Could not find user by name')
            err.name = 'userNotFound'
            throw err
        }
        return user
    },

    async findByEmail(email) {
        const user = await User.findByEmail(email)
        if (!user) {
            const err = new Error('Could not find user by email')
            err.name = 'userNotFound'
            throw err
        }
        return user
    },

    async findById(id) {
        const user = await User.findUserById(id)
        if (!user) {
            const err = new Error('Could not find user by id')
            err.name = 'userNotFound'
            throw err
        }
        return user
    },
    /*
    async findStudentsByTeacherID(teacherID){
        return await User.findByRole(role)
    },
    */
    async updateUserRole(id, role) {
        if (role === 'student') {
            role = 'teacher'
        } else if (role === 'teacher') {
            role = 'student'
        }
        // This also returns password_hash to client!
        return await User.updateUserRole(id, role)
    },

    async updateUserPassword(id, password) {
        const password_hash = await bcrypt.hash(password, saltRounds)
        return await User.updateUserPassword(id, password_hash)
    },

    async findOrCreateFederatedCredentials(profile) {
        return await User.findOrCreateUserFromGoogle(profile)
    },

    async createStudent({ name, password, teacherId }) {
        const existing = await User.findStudentByNameAndTeacher(name, teacherId)
        if (existing) {
            const err = new Error('Student name already taken for this teacher')
            err.status = 400
            throw err
        }
        const password_hash = await bcrypt.hash(password, saltRounds)
        return User.create({
            name,
            password_hash,
            role: 'student',
            grade: 1,
            teacher_id: teacherId
        })
    },

    async getStudentsByTeacher(teacherId) {
        return await User.findStudentsByTeacher(teacherId)
    },

    async deleteStudent(id) {
        return await User.deleteUser(id)
    },

    async updateProfile({ reqId, id, name, avatar, role, grade }) {
        if (role === 'student' && reqId !== id) {
            const err = new Error('Request denied, student tried to update someone elses profile')
            err.userDetails = 'Voit muokata vain omaa profiiliasi'
            err.status = 403
            throw err
        }
        const user = await User.findUserById(id)
        // Only allow teachers to edit the profile of THEIR students
        if (role === 'teacher' && reqId !== id && user?.teacher_id !== reqId) {
            const err = new Error('Request denied, teachers can only update the profile of THEIR students')
            err.userDetails = 'Voit muokata vain omaa tai omien oppilaitesi profiilia'
            err.status = 403
            throw err
        }
        if (name && name !== user.name) {
            const existingName = await User.findByName(name)
            if (existingName) {
                const err = new Error('Name already taken')
                err.userDetails = 'Nimi on varatattu, valitse toinen'
                err.status = 400
                throw err
            }
        }
        if (!grade) grade = user.grade

        // if editing own profile or teacher editing
        return await User.completeUserProfile(
            id,
            name ?? user.name,
            avatar ?? user.avatar,
            grade
        )
    }
}

export default UserService