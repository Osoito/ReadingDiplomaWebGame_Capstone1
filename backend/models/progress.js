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
    },
    async findByLevel(level, user){
        level = Number(level)
        user = Number(user)
        //console.log('level id in model: ', level)
        //console.log('user id in model: ', user)
        return db('progress')
            .select('level', 'user', 'book', 'current_page', 'level_status')
            .where({ level, user })
            .first()
    },
    async completeLevel(level, user){
        level = Number(level)
        user = Number(user)
        return db('progress')
            .where({ level, user })
            .update({ level_status: 'complete' })
            .returning('*')
    },
    async getAll(){
        return db('progress')
            .select('*')
    }
}

export default Progress