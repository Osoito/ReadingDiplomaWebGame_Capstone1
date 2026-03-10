import Book from '../models/book.js'

const BookService = {
    async addBook({ title, author, coverimage, booktype, content }) {
        const existing = await Book.findByTitle(title)
        if (existing) {
            const err = new Error(`A book with the title '${title}' already exists`)
            err.status = 400
            throw err
        }

        return Book.create({
            title,
            author,
            coverimage,
            booktype,
            content
        })
    },

    async getAllBooks() {
        const books = Book.getAll()
        if (!books) {
            const err = new Error(`No books were found`)
            err.status = 404
            throw err
        }
        return books
    },

    async findBookById(id) {
        const book = Book.findBookById(id)
        if (!book) {
            const err = new Error(`Book not found`)
            err.status = 404
            throw err
        }
        return book
    }
}

export default BookService