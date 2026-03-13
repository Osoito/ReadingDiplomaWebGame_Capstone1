import { test, expect } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'
import { describe } from 'zod/v4/core'
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

        const result = Book.findByTitle(input[2].title, trx)

        expect(result.length).toBe(1)

        expect(result.title).toBe(input.title)
        expect(result.author).toBe(input.author)
        expect(result.coverimage).toBe(input.coverimage)
        expect(result.booktype).toBe(input.booktype)
        expect(result.content).toBe(input.content)
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

        const result = Book.findBookById(2, trx)

        expect(result.length).toBe(1)

        expect(result.title).toBe(input.title)
        expect(result.author).toBe(input.author)
        expect(result.coverimage).toBe(input.coverimage)
        expect(result.booktype).toBe(input.booktype)
        expect(result.content).toBe(input.content)
    })
})