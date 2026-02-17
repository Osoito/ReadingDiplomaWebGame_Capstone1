import Book from '../models/book.js'

const BookService = {
    async addBook({ title, author, coverimage, booktype }) {
        const existing = await Book.findByTitle(title)
        if (existing) {
            const err = new Error('Book with this title already exists')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }

        try {
            return Book.create({
                title,
                author,
                coverimage,
                booktype
            })
        } catch (error) {
            // Should this be an Internal server error?
            const err = new Error('Failed to add a book')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    async getAllBooks() {
        return Book.getAll()
    },

    async findBookById(id){
        return Book.findBookById(id)
    }
}

export default BookService