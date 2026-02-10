import db from '../db/db.js'

const Book = {
    async create({ title, author, coverimage, booktype }) {
        return db('books')
            .insert({ title, author, coverimage, booktype })
            .returning('*')
    },

    async findByTitle(title) {
        return db('books')
            .select('title', 'author', 'coverimage', 'booktype')
            .where({ title })
            .first()
    },

    async getAll() {
        return db('books')
            .select('*')
    }
}

export default Book