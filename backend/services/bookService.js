import Book from '../models/book.js'

// Service layer for user related operations

const BookService = {
    async addBook({ title, author, coverimage, booktype }) {
        const existing = await Book.findByTitle(title)
        if (existing) {
            throw new Error('Book already exists')
        }

        return Book.create({
            title,
            author,
            coverimage,
            booktype
        })
    },

    // add more services here
    async getAllBooks() {
        return Book.getAll()
    }
}

// service layer functions used by controllers

export default BookService