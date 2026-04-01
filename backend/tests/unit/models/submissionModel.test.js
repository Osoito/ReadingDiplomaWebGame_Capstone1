import { test, expect, describe } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'
import Submission from '../../../models/submission.js'
const db = knex(config.test_Unit)
let trx

describe('Submission model tests', () => {
    // runs before every test
    beforeEach(async () => {
        trx = await db.transaction()
    })

    // runs after every test
    afterEach(async () => {
        await trx.rollback()
    })

    test('Add multiple submissions and get them', async() => {
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

        const progressEntries = [{
            level: 1,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 2,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 1,
            user: usersInDB[1].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        }]

        await trx('progress').insert(progressEntries)

        const entriesInDB = await trx('progress').select('*')

        const input = [
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[0].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[1].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[1].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[2].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            }
        ]

        for(const submission of input){
            await Submission.create(submission, trx)
        }

        const result = await Submission.getAll(trx)

        expect(result.length).toBe(3)

        expect(result[0].user).toBe(input[0].user)
        expect(result[0].completedLevel).toBe(input[0].completedLevel)
        expect(result[1].user).toBe(input[1].user)
        expect(result[1].completedLevel).toBe(input[1].completedLevel)
        expect(result[2].user).toBe(input[2].user)
        expect(result[2].completedLevel).toBe(input[2].completedLevel)
    })

    test('Get all based on user', async() => {
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

        const progressEntries = [{
            level: 1,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 2,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 1,
            user: usersInDB[1].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        }]

        await trx('progress').insert(progressEntries)

        const entriesInDB = await trx('progress').select('*')

        const input = [
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[0].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[1].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[1].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[2].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            }
        ]

        for(const submission of input){
            await Submission.create(submission, trx)
        }


        const result = await Submission.getAllBasedOnUser(usersInDB[0].id, trx)

        expect(result.length).toBe(2)

        expect(result[0].user).toBe(input[0].user)
        expect(result[0].completedLevel).toBe(input[0].completedLevel)
        expect(result[1].user).toBe(input[1].user)
        expect(result[1].completedLevel).toBe(input[1].completedLevel)
    })

    test('Get specific submission', async () => {
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

        const progressEntries = [{
            level: 1,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 2,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 1,
            user: usersInDB[1].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        }]

        await trx('progress').insert(progressEntries)

        const entriesInDB = await trx('progress').select('*')

        const input = [
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[0].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[1].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[1].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[2].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            }
        ]

        for(const submission of input){
            await Submission.create(submission, trx)
        }

        const result = await Submission.getSpecific(usersInDB[0].id, entriesInDB[1].id, trx)

        expect(result.user).toBe(input[1].user)
        expect(result.completedLevel).toBe(input[1].completedLevel)
    })

    test('Get by id', async() => {
        const teacher = {
            email: 'testTeacher@test.com',
            name: 'testTeacher',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null,
            role: 'teacher'
        }
        await trx('users').insert(teacher)
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
            teacher_id: teacherInDB[0].id
        }]
        await trx('users').insert(users)

        const studentsInDB = await trx('users')
            .whereNot({ role: 'teacher' })
            .select('*')


        const progressEntries = [{
            level: 1,
            user: studentsInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 2,
            user: studentsInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 1,
            user: studentsInDB[1].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        }]

        await trx('progress').insert(progressEntries)

        const entriesInDB = await trx('progress').select('*')

        const input = [
            {
                user: studentsInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[0].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: studentsInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[1].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: studentsInDB[1].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[2].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            }
        ]

        for(const submission of input){
            await Submission.create(submission, trx)
        }

        const submissionEntries = await Submission.getAll(trx)
        const result = await Submission.getById(submissionEntries[1].id, studentsInDB[0].teacher_id, trx)

        expect(result.user).toBe(input[1].user)
        expect(result.completedLevel).toBe(input[1].completedLevel)
        expect(result.question1).toBe(input[1].question1)
        expect(result.answer1).toBe(input[1].answer1)
        expect(result.question2).toBe(input[1].question2)
        expect(result.answer2).toBe(input[1].answer2)
        expect(result.question3).toBe(input[1].question3)
        expect(result.answer3).toBe(input[1].answer3)
    })

    test('Remove a submission', async() => {
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

        const progressEntries = [{
            level: 1,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 2,
            user: usersInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 1,
            user: usersInDB[1].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        }]

        await trx('progress').insert(progressEntries)

        const entriesInDB = await trx('progress').select('*')

        const input = [
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[0].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[1].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: usersInDB[1].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[2].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            }
        ]

        for(const submission of input){
            await Submission.create(submission, trx)
        }
        const submissionEntries = await Submission.getAll(trx)
        Submission.remove(submissionEntries[1].id, trx)

        const result = await Submission.getAll(trx)

        expect(result.length).toBe(2)
        expect(result[0].user).toBe(input[0].user)
        expect(result[0].completedLevel).toBe(input[0].completedLevel)
        expect(result[1].user).toBe(input[2].user)
        expect(result[1].completedLevel).toBe(input[2].completedLevel)
    })

    test('Get all submissions for a teacher from their students', async() => {
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


        const progressEntries = [{
            level: 1,
            user: studentsInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 2,
            user: studentsInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 1,
            user: studentsInDB[1].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        }]

        await trx('progress').insert(progressEntries)

        const entriesInDB = await trx('progress').select('*')

        const input = [
            {
                user: studentsInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[0].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: studentsInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[1].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: studentsInDB[1].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[2].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            }
        ]

        for(const submission of input){
            await Submission.create(submission, trx)
        }

        const result = await Submission.getSubmissionsForTeacher(teacherInDB[0].id, trx)

        expect(result.length).toBe(2)

        expect(result[0].user).toBe(input[0].user)
        expect(result[0].completedLevel).toBe(input[0].completedLevel)
        expect(result[0].name).toBe(studentsInDB[0].name)
        expect(result[1].user).toBe(input[1].user)
        expect(result[1].completedLevel).toBe(input[1].completedLevel)
        expect(result[1].name).toBe(studentsInDB[0].name)
    })

    test('Get all submission from a specific student of the current teacher', async() => {
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

        const progressEntries = [{
            level: 1,
            user: studentsInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 2,
            user: studentsInDB[0].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        },
        {
            level: 1,
            user: studentsInDB[1].id,
            book: null,
            current_progress: 100,
            level_status: 'complete'
        }]

        await trx('progress').insert(progressEntries)

        const entriesInDB = await trx('progress').select('*')

        const input = [
            {
                user: studentsInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[0].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: studentsInDB[0].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[1].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            },
            {
                user: studentsInDB[1].id,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: entriesInDB[2].id,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test Answer 3'
            }
        ]

        for(const submission of input){
            await Submission.create(submission, trx)
        }

        const result = await Submission.getSubmissionsForTeacherByStudent(studentsInDB[0].id, teacherInDB[0].id, trx)

        expect(result.length).toBe(2)

        expect(result[0].user).toBe(input[0].user)
        expect(result[0].completedLevel).toBe(input[0].completedLevel)
        expect(result[1].user).toBe(input[1].user)
        expect(result[1].completedLevel).toBe(input[1].completedLevel)
    })
})