import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport from '../testConfig/passport-mock.js'
import middleware from '../../utils/middleware.js'


// Mock progressService functions
vi.doMock('../../services/progressService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            addNewProgress: vi.fn(),
            findByUser: vi.fn(),
            findSpecificEntry: vi.fn(),
            getCurrentLevel: vi.fn(),
            completeLevel: vi.fn(),
            changeBookinEntry: vi.fn()
        }
    }
})

const progressRouter = (await import('../../controllers/progressController.js')).default
const ProgressService = (await import('../../services/progressService.js')).default

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

app.use('/api/progress', progressRouter)
const api = supertest(app)

describe('Progress controller related unit tests', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Adding a progress entry', async() => {
        const input = {
            level: 1,
            user: 1
        }

        const mockoutput = {
            id: 1,
            level: 1,
            user: 1,
            book:null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        ProgressService.addNewProgress.mockResolvedValue(mockoutput)

        const response = await api
            .post('/api/progress/add-entry')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(mockoutput)

        expect(ProgressService.addNewProgress).toHaveBeenCalledTimes(1)
        expect(ProgressService.addNewProgress).toHaveBeenCalledWith(input)
    })

    test('Find all current users entries', async() => {
        const mockoutput = [
            {
                id: 1,
                level: 1,
                user: 1,
                book:null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                id: 1,
                level: 2,
                user: 1,
                book:null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                id: 1,
                level: 3,
                user: 1,
                book:null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        ]
        ProgressService.findByUser.mockResolvedValue(mockoutput)

        const response = await api
            .get('/api/progress/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(mockoutput)

        expect(ProgressService.findByUser).toHaveBeenCalledTimes(1)
    })

    test('Get specific entry from current user', async() => {
        const mockoutput = {
            id: 1,
            level: 1,
            user: 1,
            book:null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        ProgressService.findSpecificEntry.mockResolvedValue(mockoutput)

        const response = await api
            .get('/api/progress/get-entry/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(mockoutput)

        expect(ProgressService.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(ProgressService.findSpecificEntry).toHaveBeenCalledWith('1', 1)
    })

    test('Get current level for current user', async() => {
        const mockoutput = {
            id: 1,
            level: 1,
            user: 1,
            book:null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        ProgressService.getCurrentLevel.mockResolvedValue(mockoutput)

        const response = await api
            .get('/api/progress/current-level')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(mockoutput)

        expect(ProgressService.getCurrentLevel).toHaveBeenCalledTimes(1)
        expect(ProgressService.getCurrentLevel).toHaveBeenCalledWith(1)
    })

    test('Mark entry as completed', async() => {
        const mockoutput = {
            id: 1,
            level: 1,
            user: 1,
            book:null,
            current_progress: 0,
            level_status: 'complete'
        }

        const input = {
            user: 1
        }

        ProgressService.completeLevel.mockResolvedValue(mockoutput)

        const response = await api
            .put('/api/progress/1/completed')
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual('Level marked as completed successfully!')

        expect(ProgressService.completeLevel).toHaveBeenCalledTimes(1)
        expect(ProgressService.completeLevel).toHaveBeenCalledWith('1', { user: 1 })
    })

    test('Updating book in entry', async() => {
        const mockoutput = {
            id: 1,
            level: 1,
            user: 1,
            book: 1,
            current_progress: 0,
            level_status: 'incomplete'
        }

        const input = {
            book: 1
        }

        ProgressService.changeBookinEntry.mockResolvedValue(mockoutput)

        const response = await api
            .put('/api/progress/1/add-book')
            .send(input)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual('Book added to entry successfully!')

        expect(ProgressService.changeBookinEntry).toHaveBeenCalledTimes(1)
        expect(ProgressService.changeBookinEntry).toHaveBeenCalledWith('1', 1, { book: 1 })
    })
})
