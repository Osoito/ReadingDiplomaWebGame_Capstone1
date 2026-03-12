import { vi, test, expect, describe, assert, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport, { useMockUser, /*useMockFailure, */clearMockPassport } from '../testConfig/passport-mock.js'
import middleware from '../../utils/middleware.js'
import helper from '../testConfig/testHelper.js'

// Mock only the required services
vi.doMock('../../services/userService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            register: vi.fn(),
            findById: vi.fn()
        }
    }
})

// Mock the addNewProgress from the progressService
vi.doMock('../../services/progressService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            addNewProgress: vi.fn()
        }
    }
})

let userService
let progressService

let usersRouter
let authRouter

let User

let agent
let api

userService = (await import('../../services/userService.js')).default
progressService = (await import('../../services/progressService.js')).default

// Import controllers which also import the services
usersRouter = (await import('../../controllers/users.js')).default
authRouter = (await import('../../controllers/auth.js')).default

// This function needs to be called after unmocking (doUnmock) anything
// and it is important to re-import anything that was unmocked between unmocking and calling this
const createApp = () => {
    const app = express()
    app.use(express.json())

    // create an express session to be used with mocked authentication
    app.use(session({
        secret: 'test',
        resave: false,
        saveUninitialized: false
    }))

    // mocked passport middleware
    app.use(passport.initialize())
    app.use(passport.session())

    // Mount routers
    app.use('/api/users', usersRouter)
    app.use('/auth', authRouter)

    app.use(middleware.errorHandler)

    agent = supertest.agent(app)
    api = supertest(app)
}

// Errors made by tests are ignored in utils/logger.js
// Removing the if statement from there for the duration of testing helps with debugging tests

// Also, when creating a test i found it useful to check which service- and model functions
// are directly or indirectly called by the controller and thinking if they need to be mocked.
// Because, if they are already mocked at the top to be used by some other test, I think they won't work
// normally and need a mockResolvedValue(value) to return an appropriate response body. Unless the mocking is cancelled
// hence all the unmocks, dynamic imports and express app recreation

describe('User registration', () => {
    beforeAll(() => {
        createApp()
    })

    afterAll(() => {
        vi.resetModules()
        vi.doUnmock('../../services/userService.js')
        vi.doUnmock('../../services/progressService.js')
    })

    afterEach(async () => {
        vi.clearAllMocks()
    })

    test('succeeds with valid data', async () => {
        // The register function uses:
        // Services: userService.register, progressService.addNewProgress
        // Models: User.findByName, User.findByEmail, User.create, Progress.findByLevel, Progress.create

        const input = {
            email: 'john@doe.com',
            name: 'John',
            password: 'Secret-1',
            avatar: 'avatars/avatar1.jpg',
            grade: 1
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

        const response = await api
            .post('/api/users/register')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.deepStrictEqual(response.body, input)
        expect(userService.register).toHaveBeenCalledWith(input)
    })

    test('creates 8 progress rows for the user', async () => {
        const input = {
            email: 'john@doe.com',
            name: 'John',
            password: 'Secret-1',
            avatar: 'avatars/avatar1.jpg',
            grade: 1
        }

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

        progressService.addNewProgress.mockResolvedValue({})

        await api
            .post('/api/users/register')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(progressService.addNewProgress).toHaveBeenCalledTimes(8)
        for (let i = 1; i <= 8; i++) {
            expect(progressService.addNewProgress).toHaveBeenCalledWith({
                level: i,
                user: createdUser[0].id
            })
        }
    })

    test('fails, if name or password is missing', async () => {
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

        assert(Object.values(noNamePost.body).includes('name: Invalid input: expected string, received undefined, '))
        assert.strictEqual(noNamePost.body.error, 'name: Invalid input: expected string, received undefined, ')

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

        assert(Object.values(noPasswordPost.body).includes('password: Invalid input: expected string, received undefined, '))
        assert.strictEqual(noPasswordPost.body.error, 'password: Invalid input: expected string, received undefined, ')
    })
})

describe('Swapping user role', async () => {
    beforeAll(async () => {
        // Mock the required functions from the user model
        // Important!!! Import/re-import the model after mocking
        vi.doMock('../../models/user.js', () => {
            return {
                default: {
                    findUserById: vi.fn(),
                    updateUserRole: vi.fn(),
                }
            }
        })

        // Importing user model after mocking
        User = (await import('../../models/user.js')).default

        // Re-importing services for their doUnmocks to take effect
        userService = (await import('../../services/userService.js')).default
        progressService = (await import('../../services/progressService.js')).default

        // Re-importing controllers which import the services
        usersRouter = (await import('../../controllers/users.js')).default
        authRouter = (await import('../../controllers/auth.js')).default

        // Re-create app after re-importing
        createApp()
    })

    afterAll(() => {
        vi.doUnmock('../../models/user.js')
        vi.resetModules()
    })

    let users

    beforeEach(() => {
        users = helper.mockedUsers

        // Mock the findUserById model.
        // Finds a user with a specific id from the helper list instead of DB
        vi.spyOn(User, 'findUserById')
            .mockImplementation(async (id) => {
                const found = Object.values(users).find(user => String(user.id) === String(id))
                return found
            })

        // Mock the updateUserRole model. Changes the user role accordingly.
        vi.spyOn(User, 'updateUserRole')
            .mockImplementation(async (id, currentRole) => {
                const foundUser = Object.values(users).find(user => String(user.id) === String(id))
                if (!foundUser || !currentRole) {
                    console.log('User role update failed, user or role was not found')
                    return undefined
                }
                foundUser.role = currentRole
                return foundUser
            })

    })

    afterEach(() => {
        clearMockPassport()
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })

    test('can be done by teachers', async () => {
        useMockUser(users.mockTeacherLogin)

        const loginResponse = await agent
            .post('/auth/login')
            .send({ name: 'root', password: 'sekret' })
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(loginResponse.body.id).toBe(users.mockTeacherLogin.id)

        const studentResponse = await agent
            .patch(`/api/users/${users.student.id}/role`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(studentResponse.body.role, 'teacher')

        const teacherResponse = await agent
            .patch(`/api/users/${users.teacher.id}/role`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(teacherResponse.body.role, 'student')

        await agent
            .post('/auth/logout')
            .expect(204)
    })

    test('cant be done by students', async () => {
        useMockUser(users.mockStudentLogin)

        const loginResponse = await agent
            .post('/auth/login')
            .send({ name: 'User', password: 'sekret' })
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(loginResponse.body.id).toBe(users.mockStudentLogin.id)

        // Uses findById and updateUserRole from userService.
        const studentResponse = await agent
            .patch(`/api/users/${users.student.id}/role`)
            .expect(403)
            .expect('Content-Type', /application\/json/)

        assert(studentResponse.body.error.includes('Forbidden'))

        const teacherResponse = await agent
            .patch(`/api/users/${users.teacher.id}/role`)
            .expect(403)
            .expect('Content-Type', /application\/json/)

        assert(teacherResponse.body.error.includes('Forbidden'))

        await agent
            .post('/auth/logout')
            .expect(204)
    })
})
