import { vi, test, expect, describe, assert } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import userService from '../../services/userService.js'
import progressService from '../../services/progressService.js'
import usersRouter from '../../controllers/users.js'
import middleware from '../../utils/middleware.js'

// Mock Auth and Validation middleware
vi.mock('../../utils/middleware.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            requireAuthentication: () => (req, res, next) => next()
        }
    }
})

// Mock the addNewProgress from the progressService
vi.mock('../../services/progressService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            addNewProgress: vi.fn()
        }
    }
})

// Mock the whole userService
// vi.mock('../../services/userService.js')

// Mock the register service
vi.mock('../../services/userService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            register: vi.fn()
        }
    }
})

const app = express()
app.use(express.json())
app.use('/api/users', usersRouter)

// Use this to print errors to console
app.use(middleware.errorHandler)

const api = supertest(app)

describe('User registration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('A new user can be created', async () => {
        const input = {
            email: 'john@doe.com',
            name: 'John',
            password: 'Secret-1',
            avatar: 'avatars/avatar1.jpg',
            grade: 1,
        }

        // For some reason this is returned as an array from userService.register
        const createdUser = [
            {
                id: 1,
                email: 'john@doe.com',
                name: 'John',
                password_hash: 'mocked_hash',
                avatar: 'avatars/avatar1.jpg',
                currently_reading: null,
                grade: 1,
                role: 'student'
            }
        ]

        // When userService.register is called, this resolved value will be returned
        userService.register.mockResolvedValue(createdUser)

        progressService.addNewProgress.mockResolvedValue({})

        const response = await api
            .post('/api/users/register')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        //expect(response.body).toEqual(input) -- expect vs. assert
        assert.deepStrictEqual(response.body, input)
        expect(userService.register).toHaveBeenCalledWith(input)

        expect(progressService.addNewProgress).toHaveBeenCalledTimes(6)
        for (let i = 1; i <= 6; i++) {
            expect(progressService.addNewProgress).toHaveBeenCalledWith({
                level: i,
                user: createdUser[0].id
            })
        }
    })

    test('User registration fails, if name or password is missing', async () => {
        const inputWithNoName = {
            email: 'john@doe.com',
            password: 'Secret-1',
            avatar: 'avatars/avatar1.jpg',
            grade: 1,
        }

        const noNamePost = await api
            .post('/api/users/register')
            .send(inputWithNoName)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        //assert.deepStrictEqual(noNamePost.body, inputWithNoName)
        //console.log(response.body.details)
        assert(noNamePost.body.error.includes('Invalid request data. Unknown, missing or malformed fields. Please check your input.'))
        assert(noNamePost.body.details.fieldErrors.name.includes('Invalid input: expected string, received undefined'))

        const inputWithNoPassword = {
            email: 'john@doe.com',
            name: 'John',
            avatar: 'avatars/avatar1.jpg',
            grade: 1,
        }

        const noPasswordPost = await api
            .post('/api/users/register')
            .send(inputWithNoPassword)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(noPasswordPost.body.error.includes('Invalid request data. Unknown, missing or malformed fields. Please check your input.'))
        assert(noPasswordPost.body.details.fieldErrors.password.includes('Invalid input: expected string, received undefined'))
    })
})

