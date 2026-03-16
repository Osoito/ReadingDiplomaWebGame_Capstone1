import { test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport from '../testConfig/passport-mock.js'
import middleware from '../../utils/middleware.js'
import { resetDB } from '../testConfig/cleanTestDB.js'


const booksRouter = (await import('../../controllers/books.js')).default
const rewardsRouter = (await import('../../controllers/rewards.js')).default

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
app.use('/api/rewards', rewardsRouter)

const api = supertest(app)

describe('Book integration tests', () => {
    beforeEach(async() => {
        await resetDB()
    })

    test('Add a book to database', async() => {
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

    test('Get all books from the database', async() => {
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

    test('Get a specific book from the database', async() => {
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

    test('Remove a book from the database', async() => {
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
    beforeEach(async() => {
        await resetDB()
        //await db('users').insert({ id:1, name: 'Test User', role: 'student', avatar: 'default.jpg' })
    })
    test('Add a reward to the database', async() => {
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
})
