import { vi, test, expect, describe } from 'vitest'
import supertest from 'supertest'
import express from 'express'

// Mock Auth and Validation middleware
vi.mock('../../utils/middleware.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            requireAuthentication: () => (request, response, next) => next(),
            zValidate: () => (req, res, next) => {
                req.validated = req.body
                next()
            }
        }
    }
})

// Mock the whole service layer
//vi.mock('../../services/userService.js')

// Mock the register service
vi.mock('../../services/userService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual,
            register: vi.fn()
        }
    }
})


import userService from '../../services/userService.js'
import usersRouter from '../../controllers/users.js'

describe('POST /api/users', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('/register creates a new user', async () => {
        const input = {
            email: 'john@doe.com',
            name: 'John',
            password: 'secret',
            avatar: 'avatars/avatar1.jpg',
            grade: 1
        }

        // Mock service response
        userService.register.mockResolvedValue(input)

        // Build a test app
        const app = express()
        app.use(express.json())
        app.use('/api/users', usersRouter)

        const api = supertest(app)

        const response = await api
            .post('/api/users/register', usersRouter)
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(input)
        expect(userService.register).toHaveBeenCalledWith(input)
    })
})

