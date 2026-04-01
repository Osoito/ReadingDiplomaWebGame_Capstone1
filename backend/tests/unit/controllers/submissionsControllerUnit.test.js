import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport from '../../testConfig/passport-mock.js'
import middleware from '../../../utils/middleware.js'

// Mock the addReward and getUserRewads from the rewardService
vi.doMock('../../../services/submissionService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            createSubmission: vi.fn(),
            getById: vi.fn(),
            deleteSubmission: vi.fn(),
            getSubmissionsForTeacher: vi.fn(),
            findByUserAndTeacher: vi.fn()
        }
    }
})

vi.doMock('../../../services/progressService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            getLatestCompletedLevel: vi.fn()
        }
    }
})

const submissionsRouter = (await import('../../../controllers/submissions.js')).default
const SubmissionService = (await import('../../../services/submissionService.js')).default
const ProgressService = (await import('../../../services/progressService.js')).default

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

        ProgressService.getLatestCompletedLevel.mockResolvedValue(currentLevel)
        SubmissionService.createSubmission.mockResolvedValue(expectedOutcome)


        const response = await api
            .post('/api/submissions/add-submission')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(expectedOutcome)

        expect(ProgressService.getLatestCompletedLevel).toHaveBeenCalledTimes(1)
        expect(SubmissionService.createSubmission).toHaveBeenCalledTimes(1)
    })

    test('Get a specific submission entry from a student', async() => {
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

        SubmissionService.getById.mockResolvedValue(expectedOutcome)

        const response = await api
            .get('/api/submissions/my-students/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)

        expect(SubmissionService.getById).toHaveBeenCalledTimes(1)
    })

    test('Delete a specific submission entry', async() => {
        const expectedOutcome = 'Submission deleted successfully'

        SubmissionService.deleteSubmission.mockResolvedValue(null)

        const response = await api
            .del('/api/submissions/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)

        expect(SubmissionService.deleteSubmission).toHaveBeenCalledTimes(1)
    })

    test('Get all current submissions from students who belong to current teacher', async() => {
        const expectedOutcome = [
            {
                user: 1,
                question1: 'Test question1',
                answer1: 'Test answer1',
                completedLevel: 1,
                name: 'testUser',
                question2: 'Test question2',
                answer2: 'Test answer2',
                question3: 'Test question3',
                answer3: 'Test answer3'
            },
            {
                user: 1,
                question1: 'Test question1',
                answer1: 'Test answer1',
                completedLevel: 2,
                name: 'testUser',
                question2: 'Test question2',
                answer2: 'Test answer2',
                question3: 'Test question3',
                answer3: 'Test answer3'
            },
            {
                user: 2,
                question1: 'Test question1',
                answer1: 'Test answer1',
                completedLevel: 3,
                name: 'testUser2',
                question2: 'Test question2',
                answer2: 'Test answer2',
                question3: 'Test question3',
                answer3: 'Test answer3'
            }
        ]

        SubmissionService.getSubmissionsForTeacher.mockResolvedValue(expectedOutcome)

        const response = await api
            .get('/api/submissions/my-students')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)

        expect(SubmissionService.getSubmissionsForTeacher).toHaveBeenCalledTimes(1)

    })

    test('Get all entries of a specific student who belongs to current teacher', async() => {
        const expectedOutcome = [
            {
                user: 1,
                question1: 'Test question1',
                answer1: 'Test answer1',
                completedLevel: 1,
                name: 'testUser',
                question2: 'Test question2',
                answer2: 'Test answer2',
                question3: 'Test question3',
                answer3: 'Test answer3'
            },
            {
                user: 1,
                question1: 'Test question1',
                answer1: 'Test answer1',
                completedLevel: 2,
                name: 'testUser',
                question2: 'Test question2',
                answer2: 'Test answer2',
                question3: 'Test question3',
                answer3: 'Test answer3'
            },
            {
                user: 1,
                question1: 'Test question1',
                answer1: 'Test answer1',
                completedLevel: 3,
                name: 'testUser2',
                question2: 'Test question2',
                answer2: 'Test answer2',
                question3: 'Test question3',
                answer3: 'Test answer3'
            }
        ]

        SubmissionService.findByUserAndTeacher.mockResolvedValue(expectedOutcome)

        const response = await api
            .get('/api/submissions/student/:id')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toStrictEqual(expectedOutcome)
    })
})