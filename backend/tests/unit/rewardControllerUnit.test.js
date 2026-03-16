import { vi, test, expect, describe, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import session from 'express-session'
import passport from '../testConfig/passport-mock.js'
import middleware from '../../utils/middleware.js'

// Mock the addReward and getUserRewads from the rewardService
vi.doMock('../../services/rewardService.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual.default,
            addReward: vi.fn(),
            getUserRewards: vi.fn()
        }
    }
})

const rewardsRouter = (await import('../../controllers/rewards.js')).default
const rewardService = (await import('../../services/rewardService.js')).default

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

app.use('/api/rewards', rewardsRouter)
const api = supertest(app)


describe('reward controller related unit tests', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Add a reward', async() => {
        const input = {
            owner: 1,
            reward_type: 'avatar',
            reward: 'avatar.jpg'
        }

        rewardService.addReward.mockResolvedValue(input)

        const response = await api
            .post('/api/rewards/add-reward')
            .send(input)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(input)

        expect(rewardService.addReward).toHaveBeenCalledTimes(1)
        expect(rewardService.addReward).toHaveBeenCalledWith(input)

    })

    test('Get specific user rewards', async() => {
        const expectedOutcome = [
            {
                owner: 1,
                reward_type: 'avatar',
                reward: 'avatar.jpg'
            },
            {
                owner: 1,
                reward_type: 'badge',
                reward: 'badge1'
            }
        ]

        rewardService.getUserRewards.mockResolvedValue(expectedOutcome)

        const response = await api
            .get('/api/rewards/1')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(expectedOutcome)
        expect(rewardService.getUserRewards).toHaveBeenCalledTimes(1)
    })

    test('Get current user rewards', async() => {
        const expectedOutcome = [
            {
                owner: 1,
                reward_type: 'avatar',
                reward: 'avatar.jpg'
            },
            {
                owner: 1,
                reward_type: 'badge',
                reward: 'badge1'
            }
        ]

        rewardService.getUserRewards.mockResolvedValue(expectedOutcome)

        const response = await api
            .get('/api/rewards/')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toEqual(expectedOutcome)
        expect(rewardService.getUserRewards).toHaveBeenCalledTimes(1)
    })
})