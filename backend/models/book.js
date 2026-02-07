//import * as db from '../db/index.js'
import db from '../db/db.js'

const Book = {
    async create({ title, author, coverimage, booktype }) {
        /*
        const result = await db.query(
            `INSERT INTO users (title, author, coverimage, booktype)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, author, coverimage, booktype`,
            [title, author, coverimage, booktype]
        )
        return result.rows[0]
        */
        return db('books')
            .insert({ title, author, coverimage, booktype })
            .returning('*')
    },

    async findByTitle(title) {
        /*
        const result = await db.query(
            'SELECT title, author, coverimage, booktype FROM books WHERE title = $1',
            [title]
        )
        return result.rows[0] || null
        */
        return db('books')
            .select('title', 'author', 'coverimage', 'booktype')
            .where({ title })
            .first()
    },

    async getAll() {
        /*
        const result = await db.query(
            'SELECT title, author, coverimage, booktype FROM books'
        )
        return result.rows
        */
        return db('books')
            .select('*')
    }
}

// requests handled by the service layer

export default Book