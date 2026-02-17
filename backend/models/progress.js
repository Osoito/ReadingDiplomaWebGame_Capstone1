import db from '../db/db.js'

const Progress = {
    async create({ level, user, book, current_page, level_status }) {
        return db('progress')
            .insert({ level, user, book, current_page, level_status })
            .returning('*')
    },
    async findByUser(user){
        return db('progress')
            .select('level', 'user', 'book', 'current_page', 'level_status')
            .where({ user:user })
            .first()
    },
    async getAll(){
        return db('progress')
            .select('*')
    }
}

export default Progress