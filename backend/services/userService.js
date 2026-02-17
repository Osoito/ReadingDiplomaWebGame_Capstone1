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
            if(!grade){
                grade = 1
            }
            if(!role){
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
        } catch (error) {
            const err = new Error('User registration failed')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    async getAllUsers() {
        try {
            return await User.getAll()
            // This could include role based filtering
        } catch (error) {
            const err = new Error('User fetching failed')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    async findByName(name){
        try {
            return await User.findByName(name)
        } catch (error) {
            const err = new Error('User not found')
            err.name = 'NotFound'
            err.message = error.message
            err.status = 404
            throw err
        }
    },

    async findByEmail(email){
        try {
            return await User.findByEmail(email)
        } catch (error) {
            const err = new Error('User not found')
            err.name = 'NotFound'
            err.message = error.message
            err.status = 404
            throw err
        }
    },

    async findById(id){
        try {
            return await User.findUserById(id)
        } catch (error) {
            const err = new Error('User not found')
            err.name = 'NotFound'
            err.message = error.message
            err.status = 404
            throw err
        }
    },
    /*
    async findStudentsByTeacherID(teacherID){
        try {
            return await User.findByRole(role)
        } catch(error){
            const err = new Error('No Users Found')
            err.name = 'NotFound'
            err.message = error.message
            err.status = 404
            throw err
        }
    },
    */
    async updateUserRole(id, role){
        try{
            if(role === 'student'){
                role = 'teacher'
            } else if(role === 'teacher'){
                role = 'student'
            }
            return await User.updateUserRole(id,role)
        }catch(error){
            const err = new Error('Role change failed')
            err.name = 'RoleChangeFail'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    async updateUserPassword(id, password){
        console.log('Password after sending: ', password)
        try{
            const password_hash = await bcrypt.hash(password, saltRounds)
            return await User.updateUserPassword(id, password_hash)
        }catch(error){
            const err = new Error('Password change failed')
            err.name = 'PasswordChangeFail'
            err.message = error.message
            err.status = 500
            throw err
        }
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