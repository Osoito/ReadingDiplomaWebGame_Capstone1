import { vi, test, expect } from 'vitest'
import Book from '../../../models/book.js'
import bookService from '../../../services/bookService.js'


// Mock the required functions from book model
vi.mock('../../../models/book.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual,
            create: vi.fn(),
            findByTitle: vi.fn(),
            getAll: vi.fn(),
            findBookById: vi.fn()
        }
    }
})


describe('Bookservice unit tests', () => {
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

        Book.create.mockResolvedValue(
            {
                id: 1,
                title: 'Test Book',
                author: 'Test Author',
                coverimage: 'coverimage.jpg',
                booktype: 'e-book',
                content: 'test/testPath'
            }
        )
        const result = await bookService.addBook(input)

        expect(Book.findByTitle).toBeCalledTimes(1)
        expect(Book.create).toHaveBeenCalledWith(input)
        expect(Book.create).toBeCalledTimes(1)

        expect(result.title).toBe(input.title)
        expect(result.author).toBe(input.author)
        expect(result.coverimage).toBe(input.coverimage)
        expect(result.booktype).toBe(input.booktype)
        expect(result.content).toBe(input.content)
    })

    test('Try to add duplicate book', async() => {
        const input = {
            title: 'Test Book',
            author: 'Test Author',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath'
        }

        Book.findByTitle.mockResolvedValue(input)

        Book.create.mockResolvedValue(
            {
                id: 1,
                title: 'Test Book',
                author: 'Test Author',
                coverimage: 'coverimage.jpg',
                booktype: 'e-book',
                content: 'test/testPath'
            }
        )

        await expect(bookService.addBook(input))
            .rejects
            .toThrow(`A book with the title '${input.title}' already exists`)

        expect(Book.create).not.toHaveBeenCalled()

        expect(Book.findByTitle).toHaveBeenCalledTimes(1)
        expect(Book.findByTitle).toHaveBeenCalledWith(input.title)
    })


    test('Get all books', async () => {
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

        Book.getAll.mockResolvedValue(mockBooks)

        const result = await bookService.getAllBooks()

        expect(Book.getAll).toBeCalledTimes(1)
        expect(result).toEqual(mockBooks)
    })

    test('Get books with no books in table', async () => {
        const mockEmptyBooks = [
            {
            }
        ]
        Book.findByTitle.mockResolvedValue(mockEmptyBooks)

        await expect(bookService.getAllBooks())
            .rejects
            .toThrow(`No books were found`)

        expect(Book.getAll).toHaveBeenCalledTimes(1)
    })

    test('Get a specific book', async () => {
        const mockBook = [
            {
                title: 'Test Book',
                author: 'Test Author',
                coverimage: 'default.jpg',
                booktype: 'e-book',
                content: 'test/testPath'
            }
        ]

        Book.findBookById.mockResolvedValue(mockBook)

        const result = await bookService.findBookById(1)

        expect(Book.findBookById).toBeCalledTimes(1)
        expect(result).toEqual(mockBook)
    })

    test('Fail to find specific book', async () => {

        Book.findBookById.mockResolvedValue(null)

        await expect(bookService.findBookById(1))
            .rejects
            .toThrow('Book not found')

        expect(Book.findBookById).toBeCalledTimes(1)
    })
})