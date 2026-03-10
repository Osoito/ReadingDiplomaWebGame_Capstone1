import db from '../db/db.js'

const Book = {
    async create({ title, author, coverimage, booktype, content }) {
        return db('books')
            .insert({ title, author, coverimage, booktype, content })
            .returning('*')
    },

    async findByTitle(title) {
        return db('books')
            .select('title', 'author', 'coverimage', 'booktype', 'content')
            .where({ title })
            .first()
    },

    async getAll() {
        return db('books')
            .select('*')
    },

    async findBookById(id){
        return db('books')
            .select('title', 'author', 'coverimage', 'booktype', 'content')
            .where({ id })
            .first()
    }
}

export default Book