import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport from '../testConfig/passport-mock.js'
import middleware from '../../utils/middleware.js'

// Mock the addReward and getUserRewads from the rewardService
vi.doMock('../../services/submissionService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            createSubmission: vi.fn()
        }
    }
})

vi.doMock('../../services/progressService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            getCurrentLevel: vi.fn()
        }
    }
})

const submissionsRouter = (await import('../../controllers/submissions.js')).default
const SubmissionService = (await import('../../services/submissionService.js')).default
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

app.use('/api/submissions', submissionsRouter)
const api = supertest(app)

describe('Submissions controller unit tests', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Add a submission', async() => {
        const input = {
            question1: 'Test question1',
            answer1: 'Test answer1',
            question2: 'Test question2',
            answer2: 'Test answer2',
            question3: 'Test question3',
            answer3: 'Test answer3'
        }

        const expectedOutcome = {
            user: 1,
            question1: 'Test question1',
            answer1: 'Test answer1',
            completedLevel: 1,
            question2: 'Test question2',
            answer2: 'Test answer2',
            question3: 'Test question3',
            answer3: 'Test answer3'
        }

        const currentLevel = {
            id: 1,
            level: 1,
            user: 1,
            book: null,
            current_progress: 100,
            level_status: 'incomplete'
        }

        ProgressService.getCurrentLevel.mockResolvedValue(currentLevel)
        SubmissionService.createSubmission.mockResolvedValue(expectedOutcome)


        const response = await api
            .post('/api/submissions/add-submission')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(expectedOutcome)

        expect(ProgressService.getCurrentLevel).toHaveBeenCalledTimes(1)
        expect(SubmissionService.createSubmission).toHaveBeenCalledTimes(1)
    })
})