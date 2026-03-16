import db from '../db/db.js'

const Progress = {
    async create({ level, user, book, current_progress, level_status }, dbConn = db) {
        return dbConn('progress')
            .insert({ level, user, book, current_progress, level_status })
            .returning('*')
    },
    async findByUser(user, dbConn = db){
        return dbConn('progress')
            .select('level', 'user', 'book', 'current_progress', 'level_status')
            .where({ user:user })
    },
    async findByLevel(level, user, dbConn = db){
        level = Number(level)
        user = Number(user)
        return dbConn('progress')
            .select('level', 'user', 'book', 'current_progress', 'level_status')
            .where({ level, user })
            .first()
    },
    async findSpecificEntry(level, user, dbConn = db){
        level = Number(level)
        user = Number(user)
        return dbConn('progress')
            .select('level', 'user', 'book', 'current_progress', 'level_status')
            .where({ level, user })
            .first()
    },
    async getCurrentLevel(user, dbConn = db){
        user = Number(user)
        return dbConn('progress')
            .select('id', 'level', 'user', 'book', 'current_progress', 'level_status')
            .where({ user:user, level_status:'incomplete' })
            .orderBy('level', 'asc')
            .first()
    },
    async completeLevel(level, user, dbConn = db){
        level = Number(level)
        user = Number(user)
        return dbConn('progress')
            .where({ level, user })
            .update({ level_status: 'complete' })
            .returning('*')
    },
    async changeBookinEntry(level, user, book, dbConn = db){
        level = Number(level)
        user = Number(user)
        return dbConn('progress')
            .where({ level, user })
            .update({ book: book })
            .returning('*')
    },
    async getAll(dbConn = db){
        return dbConn('progress')
            .select('*')
    }
}

export default Progress