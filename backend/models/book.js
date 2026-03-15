import db from '../db/db.js'

const Book = {
    async create({ title, author, coverimage, booktype, content }, dbConn = db) {
        return dbConn('books')
            .insert({ title, author, coverimage, booktype, content })
            .returning('*')
    },

    async findByTitle(title, dbConn = db) {
        return dbConn('books')
            .select('title', 'author', 'coverimage', 'booktype', 'content')
            .where({ title })
            .first()
    },

    async getAll(dbConn = db) {
        return dbConn('books')
            .select('*')
    },

    async findBookById(id, dbConn = db){
        return dbConn('books')
            .select('title', 'author', 'coverimage', 'booktype', 'content')
            .where({ id })
            .first()
    }
}

export default Book