import { test, expect, describe } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'
import Book from '../../../models/book.js'
const db = knex(config.test_Unit)
let trx



describe('bookModel unit tests', () => {
    // runs before every test
    beforeEach(async () => {
        trx = await db.transaction()
    })

    // runs after every test
    afterEach(async () => {
        await trx.rollback()
    })

    test('Add multiple books and get them', async () => {
        const input = [
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

        for (const book of input) {
            await Book.create(book, trx)
        }

        const result = await Book.getAll(trx)

        expect(result.length).toBe(3)

        expect(result[0].title).toBe(input[0].title)
        expect(result[1].title).toBe(input[1].title)
        expect(result[2].title).toBe(input[2].title)
    })

    test('Find by title', async () => {
        const input = [
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

        for (const book of input) {
            await Book.create(book, trx)
        }

        const result = await Book.findByTitle(input[2].title, trx)

        expect(result.title).toBe(input[2].title)
        expect(result.author).toBe(input[2].author)
        expect(result.coverimage).toBe(input[2].coverimage)
        expect(result.booktype).toBe(input[2].booktype)
        expect(result.content).toBe(input[2].content)
    })

    test('Find book by id', async() => {
        const input = [
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
        for (const book of input) {
            await Book.create(book, trx)
        }
        //Gets books so that the id can be used in the findBookById function, since the ids are not set in stone.
        const books = await Book.getAll(trx)
        const result = await Book.findBookById(books[2].id, trx)

        expect(result.title).toBe(input[2].title)
        expect(result.author).toBe(input[2].author)
        expect(result.coverimage).toBe(input[2].coverimage)
        expect(result.booktype).toBe(input[2].booktype)
        expect(result.content).toBe(input[2].content)
    })

    test('Remove book from database', async() => {
        const input = [
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

        for (const book of input) {
            await Book.create(book, trx)
        }
        const books = await Book.getAll(trx)
        await Book.deleteBook(books[1].id, trx)


        const result = await Book.getAll(trx)

        expect(result.length).toBe(2)

        expect(result[0].title).toBe(input[0].title)
        expect(result[1].title).toBe(input[2].title)
    })
})