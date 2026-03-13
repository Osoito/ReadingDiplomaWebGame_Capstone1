import { test, expect } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'
import { describe } from 'zod/v4/core'
import Reward from '../../../models/reward.js'
const db = knex(config.test_Unit)
let trx

describe('rewardModel unit tests', () => {
    // runs before every test
    beforeEach(async () => {
        trx = await db.transaction()
    })

    // runs after every test
    afterEach(async () => {
        await trx.rollback()
    })

    test('Add multiple rewards', async() => {
        const input = [
            {
                owner: 1,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            },
            {
                owner: 1,
                reward_type: 'badge2',
                reward: 'testbadge2.jpg'
            },
            {
                owner: 2,
                reward_type: 'avatar',
                reward: 'avatar1.jpg'
            }
        ]

        for(const reward of input){
            await Reward.add(reward, trx)
        }

        const result = await trx('rewards').select('*')

        expect(result.length).toBe(3)
        expect(result[0].reward).toBe(input[0].reward)
        expect(result[1].reward).toBe(input[1].reward)
        expect(result[2].reward).toBe(input[2].reward)
    })

    test('Get specific user reward', async() => {
        const input = [
            {
                owner: 1,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            },
            {
                owner: 1,
                reward_type: 'badge2',
                reward: 'testbadge2.jpg'
            },
            {
                owner: 2,
                reward_type: 'avatar',
                reward: 'avatar1.jpg'
            }
        ]

        for(const reward of input){
            await Reward.add(reward, trx)
        }

        const result = await Reward.getByRewardAndUser(2, 'avatar1.jpg', trx)

        expect(result.length).toBe(1)
        expect(result.owner).toBe(input[2].owner)
        expect(result.reward_type).toBe(input[2].reward_type)
        expect(result.reward).toBe(input[2].reward)
    })

    test('Get all rewards of a specific user', async() => {
        const input = [
            {
                owner: 1,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            },
            {
                owner: 1,
                reward_type: 'badge2',
                reward: 'testbadge2.jpg'
            },
            {
                owner: 2,
                reward_type: 'avatar',
                reward: 'avatar1.jpg'
            }
        ]

        for(const reward of input){
            await Reward.add(reward, trx)
        }

        const result = await Reward.getUserRewards(1, trx)

        expect(result.length).toBe(2)
        expect(result[0].owner).toBe(input[0].owner)
        expect(result[0].reward_type).toBe(input[0].reward_type)
        expect(result[0].reward).toBe(input[0].reward)

        expect(result[1].owner).toBe(input[1].owner)
        expect(result[1].reward_type).toBe(input[1].reward_type)
        expect(result[1].reward).toBe(input[1].reward)
    })
})