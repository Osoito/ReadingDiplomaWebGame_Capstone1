import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport from '../testConfig/passport-mock.js'
import middleware from '../../utils/middleware.js'

// Mock the addBook, getAllBooks and findBookById from the bookService
vi.doMock('../../services/bookService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            addBook: vi.fn(),
            getAllBooks: vi.fn(),
            findBookById: vi.fn(),
            deleteBook: vi.fn()
        }
    }
})

const booksRouter = (await import('../../controllers/books.js')).default
const bookService = (await import('../../services/bookService.js')).default

const app = express()
app.use(express.json())
// create an express session to be used with mocked authentication
app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false
}))
app.use((request, response, next) => {
    request.user = { id: 123, role: 'teacher' }
    next()
})
// mocked passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(middleware.errorHandler)

app.use('/api/books', booksRouter)
const api = supertest(app)



describe('Book unit tests', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Add a book', async() => {
        const input = {
            title: 'Test Book',
            author: 'Test Author',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath'
        }

        bookService.addBook.mockResolvedValue(input)

        const response = await api
            .post('/api/books/')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(input)

        expect(bookService.addBook).toHaveBeenCalledTimes(1)
        expect(bookService.addBook).toHaveBeenCalledWith(input)
    })

    test('Get all books', async() => {
        const mockBooks = [
            {
                title: 'Test Book',
                author: 'Test Author',
                coverimage: 'default.jpg',
                booktype: 'e-book',
                content: 'test/testPath'
            },
            {
                title: 'Test Book2',
                author: 'Test Author2',
                coverimage: 'default.jpg',
                booktype: 'e-book',
                content: 'test/testPath2'
            },
            {
                title: 'Test Book3',
                author: 'Test Author3',
                coverimage: 'default.jpg',
                booktype: 'e-book',
                content: 'test/testPath3'
            }
        ]

        bookService.getAllBooks.mockResolvedValue(mockBooks)

        const response = await api
            .get('/api/books/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(mockBooks)
        expect(bookService.getAllBooks).toHaveBeenCalledTimes(1)
    })

    test('Get a specific book', async() => {
        const mockBook = [
            {
                title: 'Test Book3',
                author: 'Test Author3',
                coverimage: 'default.jpg',
                booktype: 'e-book',
                content: 'test/testPath3'
            }
        ]

        bookService.findBookById.mockResolvedValue(mockBook)

        const response = await api
            .get('/api/books/3')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(mockBook)
        expect(bookService.findBookById).toHaveBeenCalledTimes(1)
    })

    test('Remove a book', async() => {
        bookService.deleteBook.mockResolvedValue(undefined)

        const response = await api
            .delete('/api/books/delete-book/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual('Book deleted successfully!')
    })

})