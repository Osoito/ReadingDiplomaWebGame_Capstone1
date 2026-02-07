import BookService from '../services/bookService.js'
import express from 'express'
const booksRouter = express.Router()

// for input validation
import { z } from 'zod'
import middleware from '../utils/middleware.js'

const booktypes = z.enum(['physical', 'e-book', 'audio'])
const bookSchema = z.object({
    title: z.string(),
    author: z.string(),
    coverimage: z.string(),
    booktype: z.string().transform(str => str.toLowerCase()).pipe(booktypes)
}).strict()

// example route for getting all books
booksRouter.get('/', async (request, response, next) => {
    try {
        const books = await BookService.getAllBooks()
        response.json(books)
    } catch (error) {
        next(error)
    }
})

booksRouter.post('/', middleware.zValidate(bookSchema), async (request, response, next) => {
    // request.validated imported from zValidate disallows unknown fields and incorrect data types
    // and returns the validated request body
    const { title, author, coverimage, booktype } = request.validated

    try {
        const newBook = {
            title,
            author,
            coverimage,
            booktype
        }

        await BookService.addBook(newBook)
        response.status(201).json(newBook)

    } catch (error) {
        next(error)
    }
})


export default booksRouter