import db from '../db/db.js'

const Progress = {
    async create({ level, user, book, current_progress, level_status }) {
        return db('progress')
            .insert({ level, user, book, current_progress, level_status })
            .returning('*')
    },
    async findByUser(user){
        return db('progress')
            .select('level', 'user', 'book', 'current_progress', 'level_status')
            .where({ user:user })
    },
    async findByLevel(level, user){
        level = Number(level)
        user = Number(user)
        return db('progress')
            .select('level', 'user', 'book', 'current_progress', 'level_status')
            .where({ level, user })
            .first()
    },
    async findSpecificEntry(level, user){
        level = Number(level)
        user = Number(user)
        return db('progress')
            .select('level', 'user', 'book', 'current_progress', 'level_status')
            .where({ level, user })
            .first()
    },
    async getCurrentLevel(user){
        user = Number(user)
        return db('progress')
            .select('level', 'user', 'book', 'current_progress', 'level_status')
            .where({ user:user, level_status:'incomplete' })
            .orderBy('level', 'asc')
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
    async changeBookinEntry(level, user, book){
        level = Number(level)
        user = Number(user)
        return db('progress')
            .where({ level, user })
            .update({ book: book })
            .returning('*')
    },
    async getAll(){
        return db('progress')
            .select('*')
    }
}

export default Progress