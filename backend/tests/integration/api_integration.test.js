import { test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport from '../testConfig/passport-mock.js'
import middleware from '../../utils/middleware.js'
import { resetDB } from '../testConfig/cleanTestDB.js'


const booksRouter = (await import('../../controllers/books.js')).default
const rewardsRouter = (await import('../../controllers/rewards.js')).default
const progressRouter = (await import('../../controllers/progressController.js')).default
const submissionsRouter = (await import('../../controllers/submissions.js')).default


const app = express()
app.use(express.json())
// create an express session to be used with mocked authentication
app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false
}))
app.use((request, response, next) => {
    request.user = { id: 1, role: 'teacher' }
    next()
})
// mocked passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(middleware.errorHandler)

app.use('/api/books', booksRouter)
app.use('/api/rewards', rewardsRouter)
app.use('/api/progress', progressRouter)
app.use('/api/submissions', submissionsRouter)

const api = supertest(app)

describe('Book integration tests', () => {
    beforeEach(async () => {
        await resetDB()
    })

    test('Add a book to database', async () => {
        const input = {
            title: 'Test Book',
            author: 'Test Author',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath'
        }


        const response = await api
            .post('/api/books/')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body.title).toBe(input.title)
        expect(response.body.author).toBe(input.author)
        expect(response.body.coverimage).toBe(input.coverimage)
        expect(response.body.booktype).toBe(input.booktype)
        expect(response.body.content).toBe(input.content)
    })

    test('Get all books from the database', async () => {
        const book1 = {
            title: 'Test Book1',
            author: 'Test Author1',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath'
        }
        const book2 = {
            title: 'Test Book2',
            author: 'Test Author2',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath2'
        }
        const book3 = {
            title: 'Test Book3',
            author: 'Test Author3',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath3'
        }
        await api.post('/api/books').send(book1)
        await api.post('/api/books').send(book2)
        await api.post('/api/books').send(book3)

        const response = await api
            .get('/api/books/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(3)

        expect(response.body.map(b => b.title)).toContain('Test Book1')
        expect(response.body.map(b => b.author)).toContain('Test Author1')
        expect(response.body.map(b => b.title)).toContain('Test Book2')
        expect(response.body.map(b => b.author)).toContain('Test Author2')
        expect(response.body.map(b => b.title)).toContain('Test Book3')
        expect(response.body.map(b => b.author)).toContain('Test Author3')
    })

    test('Get a specific book from the database', async () => {
        const book1 = {
            title: 'Test Book1',
            author: 'Test Author1',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath'
        }
        const book2 = {
            title: 'Test Book2',
            author: 'Test Author2',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath2'
        }
        const book3 = {
            title: 'Test Book3',
            author: 'Test Author3',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath3'
        }

        await api.post('/api/books').send(book1)
        await api.post('/api/books').send(book2)
        await api.post('/api/books').send(book3)

        const response = await api
            .get('/api/books/2')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.title).toBe(book2.title)
        expect(response.body.author).toBe(book2.author)
        expect(response.body.coverimage).toBe(book2.coverimage)
        expect(response.body.booktype).toBe(book2.booktype)
        expect(response.body.content).toBe(book2.content)
    })

    test('Remove a book from the database', async () => {
        const book1 = {
            title: 'Test Book1',
            author: 'Test Author1',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath'
        }
        const book2 = {
            title: 'Test Book2',
            author: 'Test Author2',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath2'
        }
        const book3 = {
            title: 'Test Book3',
            author: 'Test Author3',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath3'
        }

        await api.post('/api/books').send(book1)
        await api.post('/api/books').send(book2)
        await api.post('/api/books').send(book3)

        const response = await api
            .delete('/api/books/delete-book/2')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toBe('Book deleted successfully!')
    })
})

describe('Reward integration tests', () => {
    beforeEach(async () => {
        await resetDB()
        //await db('users').insert({ id:1, name: 'Test User', role: 'student', avatar: 'default.jpg' })
    })

    test('Add a reward to the database', async () => {
        const input = {
            owner: 1,
            reward_type: 'avatar',
            reward: 'avatar.jpg'
        }
        const response = await api
            .post('/api/rewards/add-reward')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)


        expect(response.body.owner).toBe(input.owner)
        expect(response.body.reward_type).toBe(input.reward_type)
        expect(response.body.reward).toBe(input.reward)
    })

    test('Get specific reward from database', async () => {
        const reward1 = {
            owner: 1,
            reward_type: 'avatar',
            reward: 'avatar.jpg'
        }
        const reward2 = {
            owner: 1,
            reward_type: 'badge',
            reward: 'badge.jpg'
        }
        const reward3 = {
            owner: 2,
            reward_type: 'avatar',
            reward: 'avatar2.jpg'
        }
        const expectedOutcome = [
            {
                reward_type: 'avatar',
                reward: 'avatar.jpg'
            },
            {
                reward_type: 'badge',
                reward: 'badge.jpg'
            }
        ]
        await api.post('/api/rewards/add-reward').send(reward1)
        await api.post('/api/rewards/add-reward').send(reward2)
        await api.post('/api/rewards/add-reward').send(reward3)

        const response = await api
            .get('/api/rewards/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)


        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get current user rewards', async () => {
        const reward1 = {
            owner: 1,
            reward_type: 'avatar',
            reward: 'avatar.jpg'
        }
        const reward2 = {
            owner: 1,
            reward_type: 'badge',
            reward: 'badge.jpg'
        }
        const reward3 = {
            owner: 2,
            reward_type: 'avatar',
            reward: 'avatar2.jpg'
        }
        const expectedOutcome = [
            {
                reward_type: 'avatar',
                reward: 'avatar.jpg'
            },
            {
                reward_type: 'badge',
                reward: 'badge.jpg'
            }
        ]

        await api.post('/api/rewards/add-reward').send(reward1)
        await api.post('/api/rewards/add-reward').send(reward2)
        await api.post('/api/rewards/add-reward').send(reward3)

        const response = await api
            .get('/api/rewards/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })
})

describe('Progress integration tests', () => {
    beforeEach(async () => {
        await resetDB()
    })

    test('Add progress entry', async () => {
        const input = {
            level: 1,
            user: 1,
        }

        const expectedOutcome = [{
            id: 1,
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }]

        const response = await api
            .post('/api/progress/add-entry')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get progress entries for current user', async () => {
        const progress1 = {
            level: 1,
            user: 1,
        }
        const progress2 = {
            level: 2,
            user: 1,
        }
        const progress3 = {
            level: 1,
            user: 2,
        }

        await api.post('/api/progress/add-entry').send(progress1)
        await api.post('/api/progress/add-entry').send(progress2)
        await api.post('/api/progress/add-entry').send(progress3)

        const expectedOutcome = [
            {
                level: 1,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        const response = await api
            .get('/api/progress/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get a specific entry', async () => {
        const progress1 = {
            level: 1,
            user: 1,
        }
        const progress2 = {
            level: 2,
            user: 1,
        }
        const progress3 = {
            level: 1,
            user: 2,
        }

        await api.post('/api/progress/add-entry').send(progress1)
        await api.post('/api/progress/add-entry').send(progress2)
        await api.post('/api/progress/add-entry').send(progress3)

        const expectedOutcome = {
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        const response = await api
            .get('/api/progress/get-entry/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Complete a level', async () => {
        const progress1 = {
            level: 1,
            user: 1,
        }
        const input = {
            user: 1
        }

        await api.post('/api/progress/add-entry').send(progress1)

        const expectedOutcome = 'Level marked as completed successfully!'

        const response = await api
            .put('/api/progress/1/completed')
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get current level', async () => {
        const progress1 = {
            level: 1,
            user: 1,
        }
        const progress2 = {
            level: 2,
            user: 1,
        }
        const progress3 = {
            level: 3,
            user: 1,
        }
        const progress4 = {
            level: 4,
            user: 1,
        }


        await api.post('/api/progress/add-entry').send(progress1)
        await api.post('/api/progress/add-entry').send(progress2)
        await api.post('/api/progress/add-entry').send(progress3)
        await api.post('/api/progress/add-entry').send(progress4)
        await api.put('/api/progress/1/completed').send({ user: 1 })
        await api.put('/api/progress/2/completed').send({ user: 1 })

        const expectedOutcome = {
            id: 3,
            level: 3,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        const response = await api
            .get('/api/progress/current-level')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Change book in progress entry', async () => {
        const progress1 = {
            level: 1,
            user: 1,
        }

        const book1 = {
            title: 'Test Book1',
            author: 'Test Author1',
            coverimage: 'coverimage.jpg',
            booktype: 'e-book',
            content: 'test/testPath'
        }

        await api.post('/api/progress/add-entry').send(progress1)
        await api.post('/api/books').send(book1)

        const input = {
            book: 1
        }

        const expectedOutcome = 'Book added to entry successfully!'

        const response = await api
            .put('/api/progress/1/add-book')
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get all entries for a specific student of the current teacher', async() => {
        const progress1 = {
            level: 1,
            user: 2,
        }
        const progress2 = {
            level: 2,
            user: 2,
        }
        const progress3 = {
            level: 3,
            user: 2,
        }
        const progress4 = {
            level: 1,
            user: 4,
        }


        await api.post('/api/progress/add-entry').send(progress1)
        await api.post('/api/progress/add-entry').send(progress2)
        await api.post('/api/progress/add-entry').send(progress3)
        await api.post('/api/progress/add-entry').send(progress4)

        const expectedOutcome = [
            {
                level: 1,
                user: 2,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: 2,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 3,
                user: 2,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]

        const response = await api
            .get('/api/progress/student/2')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })
})

describe('Submission integration tests', () => {
    beforeEach(async () => {
        await resetDB()
    })

    test('Adding a submission', async () => {
        const progress1 = {
            level: 1,
            user: 1,
        }

        const progressUser = {
            user: progress1.user
        }

        await api.post('/api/progress/add-entry').send(progress1)

        await api.put(`/api/progress/${progress1.level.toString()}/completed`).send(progressUser)

        const input = {
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        const expectedOutcome = {
            user: 1,
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            completedLevel: 1, // id of the completed progress entry
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        const response = await api
            .post('/api/submissions/add-submission')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get specific submission from a student', async () => {
        const progress1 = {
            level: 1,
            user: 2,
        }

        const progressUser = {
            user: progress1.user
        }

        await api.post('/api/progress/add-entry').send(progress1)

        await api.put(`/api/progress/${progress1.level.toString()}/completed`).send(progressUser)

        const submission1 = {
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 2, role: 'student' }))
            .send(submission1)

        const expectedOutcome = {
            user: 2,
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            completedLevel: 1, // id of the completed progress entry
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        const response = await api
            .get('/api/submissions/my-students/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Delete a submission', async () => {
        const progress1 = {
            level: 1,
            user: 2,
        }

        const progressUser = {
            user: progress1.user
        }

        await api.post('/api/progress/add-entry').send(progress1)

        await api.put(`/api/progress/${progress1.level.toString()}/completed`).send(progressUser)

        const submission1 = {
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 2, role: 'student' }))
            .send(submission1)

        const expectedOutcome = 'Submission deleted successfully'

        const response = await api
            .del('/api/submissions/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get student submission entries for teacher', async () => {
        const progresses = [
            { level: 1, user: 2, name: 'Alice' },
            { level: 1, user: 3, name: 'Kalle' },
            { level: 1, user: 4, name: 'Unknown' }
        ]

        // Store progress IDs by user and level
        const progressIds = {}
        for (const progress of progresses) {
            const res = await api.post('/api/progress/add-entry').send({ level: progress.level, user: progress.user })
            const [resProgress] = res.body
            if (!progressIds[progress.user]) progressIds[progress.user] = {}
            progressIds[progress.user][progress.level] = resProgress.id
        }

        // Also add another progress entry for user 2 level 2
        const user2Level2 = { level: 2, user: 2, name: 'Alice' }
        const user2ProgressEntryRes = await api.post('/api/progress/add-entry').send({ level: user2Level2.level, user: user2Level2.user })
        const [resProgress] = user2ProgressEntryRes.body
        progressIds[user2Level2.user][user2Level2.level] = resProgress.id

        // Mark each progress as completed
        for (const progress of progresses) {
            const progressUser = { user: progress.user }
            await api.put(`/api/progress/${progress.level}/completed`).send(progressUser)
        }

        const submission = {
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 2, role: 'student' }))
            .send(submission)

        // make progress entry for user 2 level 2 complete, so the next submission associates the correct completedLevel id
        await api.put(`/api/progress/${user2Level2.level.toString()}/completed`).send({ user: user2Level2.user })

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 2, role: 'student' }))
            .send(submission)

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 3, role: 'student' }))
            .send(submission)

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 4, role: 'student' }))
            .send(submission)

        const expectedOutcome = [
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: progressIds[2][1], // [2] <-- user 2, [1] <-- level 1
                name: 'Alice',
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            },
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: progressIds[2][2],
                name: 'Alice',
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            },
            {
                user: 3,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: progressIds[3][1],
                name: 'Kalle',
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            }
        ]

        const response = await api
            .get('/api/submissions/my-students')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })

    test('Get all submission entries from a specific student of the current teacher', async() => {
        const progresses = [
            { level: 1, user: 2, name: 'Alice' },
            { level: 1, user: 3, name: 'Kalle' },
            { level: 1, user: 4, name: 'Unknown' }
        ]

        // Store progress IDs by user and level
        const progressIds = {}
        for (const progress of progresses) {
            const res = await api.post('/api/progress/add-entry').send({ level: progress.level, user: progress.user })
            const [resProgress] = res.body
            if (!progressIds[progress.user]) progressIds[progress.user] = {}
            progressIds[progress.user][progress.level] = resProgress.id
        }

        // Also add another progress entry for user 2 level 2
        const user2Level2 = { level: 2, user: 2, name: 'Alice' }
        const user2ProgressEntryRes = await api.post('/api/progress/add-entry').send({ level: user2Level2.level, user: user2Level2.user })
        const [resProgress] = user2ProgressEntryRes.body
        progressIds[user2Level2.user][user2Level2.level] = resProgress.id

        // Mark each progress as completed
        for (const progress of progresses) {
            const progressUser = { user: progress.user }
            await api.put(`/api/progress/${progress.level}/completed`).send(progressUser)
        }

        const submission = {
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 2, role: 'student' }))
            .send(submission)

        // make progress entry for user 2 level 2 complete, so the next submission associates the correct completedLevel id
        await api.put(`/api/progress/${user2Level2.level.toString()}/completed`).send({ user: user2Level2.user })

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 2, role: 'student' }))
            .send(submission)

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 3, role: 'student' }))
            .send(submission)

        await api.post('/api/submissions/add-submission')
            .set('x-test-user', JSON.stringify({ id: 4, role: 'student' }))
            .send(submission)

        const expectedOutcome = [
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: progressIds[2][1], // [2] <-- user 2, [1] <-- level 1
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            },
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: progressIds[2][2],
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            }
        ]

        const response = await api
            .get('/api/submissions/student/2')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })
})