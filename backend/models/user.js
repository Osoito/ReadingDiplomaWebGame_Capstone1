import db from '../db/db.js'

const User = {
    async create({ email, name, password_hash, avatar, currently_reading, grade, role, teacher_id }) {
        return db('users')
            .insert({ email, name, password_hash, avatar, currently_reading, grade, role, teacher_id })
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
        return db('users')
            .select('id', 'email', 'name', 'password_hash', 'avatar', 'currently_reading', 'grade', 'role', 'teacher_id')
            .where({ id })
            .first()
    },
    /*
    async findStudentsByTeacherID(teacherID){
        return db('users')
            .select('id', 'email', 'name', 'avatar', 'currently_reading', 'grade', 'role')
            .where({  })
    },
    */
    async getAll() {
        return db('users')
            .select('id', 'email', 'name', 'avatar', 'currently_reading', 'grade', 'role', 'teacher_id')
    },

    async updateUserRole(id, role) {
        return db('users')
            .where({ id })
            .update({ role: role })
            .returning('*')
    },

    async updateUserPassword(id, password_hash) {
        return db('users')
            .where({ id })
            .update({ password_hash: password_hash })
            .returning('*')
    },

    async findFederatedCredentials(provider, provider_user_id) {
        return db('federated_credentials')
            .where({ provider, provider_user_id })
            .first()
    },

    async createFederatedCredentials(user_id, provider, provider_user_id) {
        return db('federated_credentials')
            .insert({ user_id, provider, provider_user_id })
            .returning('*')
    },

    async deleteFederatedCredentials(id) {
        return db('federated_credentials')
            .where({ id })
            .del()
    },

    async findTeacherByName(name) {
        return db('users')
            .select('id', 'email', 'name', 'role')
            .whereRaw('LOWER(name) = LOWER(?)', [name])
            .where({ role: 'teacher' })
            .first()
    },

    async findStudentByNameAndTeacher(name, teacherId) {
        return db('users')
            .select('id', 'email', 'name', 'password_hash', 'avatar', 'currently_reading', 'grade', 'role', 'teacher_id')
            .whereRaw('LOWER(name) = LOWER(?)', [name])
            .where({ teacher_id: teacherId })
            .first()
    },

    async findStudentsByTeacher(teacherId) {
        return db('users')
            .select('id', 'name', 'avatar', 'grade', 'role')
            .where({ teacher_id: teacherId, role: 'student' })
    },

    async deleteUser(id) {
        return db('users')
            .where({ id })
            .del()
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