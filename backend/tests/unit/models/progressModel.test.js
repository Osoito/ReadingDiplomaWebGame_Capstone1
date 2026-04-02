import { test, expect, describe } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'
import Progress from '../../../models/progress.js'
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

    test('Create multiple progress entries and get them all', async() => {
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                level: 1,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 3,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        for(const entry of input){
            await Progress.create(entry, trx)
        }

        const result = await Progress.getAll(trx)

        expect(result.length).toBe(3)

        expect(result[0].level).toBe(input[0].level)
        expect(result[1].level).toBe(input[1].level)
        expect(result[2].level).toBe(input[2].level)
    })

    test('Find entries by user', async() => {
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                level: 1,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: usersInDB[1].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 3,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        for(const entry of input){
            await Progress.create(entry, trx)
        }

        const result = await Progress.findByUser(usersInDB[0].id, trx)

        expect(result.length).toBe(2)

        expect(result[0].level).toBe(input[0].level)
        expect(result[1].level).toBe(input[2].level)
    })

    test('Find specific level for user', async() => {
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                level: 1,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: usersInDB[1].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 3,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        for(const entry of input){
            await Progress.create(entry, trx)
        }


        const result = await Progress.findSpecificEntry(1, usersInDB[0].id, trx)


        expect(result.level).toBe(input[0].level)
        expect(result.user).toBe(input[0].user)
        expect(result.book).toBe(input[0].book)
        expect(result.current_progress).toBe(input[0].current_progress)
        expect(result.level_status).toBe(input[0].level_status)
    })

    test('Get current level', async() => {
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                level: 1,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'complete'
            },
            {
                level: 2,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'complete'
            },
            {
                level: 3,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'complete'
            },
            {
                level: 4,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'complete'
            },
            {
                level: 5,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 6,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 7,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 8,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        for(const entry of input){
            await Progress.create(entry, trx)
        }

        const result = await Progress.getCurrentLevel(usersInDB[0].id, trx)

        expect(result.level).toBe(input[4].level)
        expect(result.user).toBe(input[4].user)
        expect(result.book).toBe(input[4].book)
        expect(result.current_progress).toBe(input[4].current_progress)
        expect(result.level_status).toBe(input[4].level_status)
    })

    test('Mark level as complete', async() => {
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                level: 1,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        for(const entry of input){
            await Progress.create(entry, trx)
        }

        const result = await Progress.completeLevel(2, usersInDB[0].id, trx)

        expect(result[0].level).toBe(input[1].level)
        expect(result[0].user).toBe(input[1].user)
        expect(result[0].book).toBe(input[1].book)
        expect(result[0].current_progress).toBe(input[1].current_progress)
        expect(result[0].level_status).toBe('complete')
    })

    test('Change book in entry', async() => {
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const books = [
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

        await trx('books').insert(books)

        const booksInDB = await trx('books').select('*')

        const input = [
            {
                level: 1,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: usersInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        for(const entry of input){
            await Progress.create(entry, trx)
        }

        const result = await Progress.changeBookinEntry(2, usersInDB[0].id, booksInDB[1].id, trx)

        expect(result[0].level).toBe(input[1].level)
        expect(result[0].user).toBe(input[1].user)
        expect(result[0].book).toBe(booksInDB[1].id)
        expect(result[0].current_progress).toBe(input[1].current_progress)
        expect(result[0].level_status).toBe(input[1].level_status)
    })

    test('Get all the entries for a specific student of the current teacher', async() => {
        const teachers = [{
            email: 'testTeacher@test.com',
            name: 'testTeacher',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null,
            role: 'teacher'
        },
        {
            email: 'testTeacher2@test.com',
            name: 'testTeacher2',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null,
            role: 'teacher'
        }]
        await trx('users').insert(teachers)
        const teacherInDB = await trx('users')
            .where({ role: 'teacher' })
            .select('*')

        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: teacherInDB[0].id
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: teacherInDB[1].id
        }]
        await trx('users').insert(users)

        const studentsInDB = await trx('users')
            .whereNot({ role: 'teacher' })
            .select('*')

        const input = [
            {
                level: 1,
                user: studentsInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: studentsInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 1,
                user: studentsInDB[1].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        const expectedOutcome = [
            {
                level: 1,
                user: studentsInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: studentsInDB[0].id,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        for(const entry of input){
            await Progress.create(entry, trx)
        }
        const result = await Progress.findByUserAndTeacher(studentsInDB[0].id, teacherInDB[0].id, trx)

        expect(result.length).toBe(expectedOutcome.length)
        for (let i = 0; i < expectedOutcome.length; i++) {
            expect(result[i].id).toBeDefined()
            expect(result[i].level).toBe(expectedOutcome[i].level)
            expect(result[i].user).toBe(expectedOutcome[i].user)
            expect(result[i].book).toBe(expectedOutcome[i].book)
            expect(result[i].current_progress).toBe(expectedOutcome[i].current_progress)
            expect(result[i].level_status).toBe(expectedOutcome[i].level_status)
        }
    })
})