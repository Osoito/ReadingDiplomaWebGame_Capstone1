import { test, expect, describe } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'
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
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                owner: usersInDB[0].id,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            },
            {
                owner: usersInDB[0].id,
                reward_type: 'badge2',
                reward: 'testbadge2.jpg'
            },
            {
                owner: usersInDB[1].id,
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
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                owner: usersInDB[0].id,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            },
            {
                owner: usersInDB[0].id,
                reward_type: 'badge2',
                reward: 'testbadge2.jpg'
            },
            {
                owner: usersInDB[1].id,
                reward_type: 'avatar',
                reward: 'avatar1.jpg'
            }
        ]

        for(const reward of input){
            await Reward.add(reward, trx)
        }

        const result = await Reward.getByRewardAndUser(usersInDB[1].id, 'avatar1.jpg', trx)

        expect(result.owner).toBe(input[2].owner)
        expect(result.reward_type).toBe(input[2].reward_type)
        expect(result.reward).toBe(input[2].reward)
    })

    test('Get all rewards of a specific user', async() => {
        const users = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            teacher_id: null
        }]
        await trx('users').insert(users)

        const usersInDB = await trx('users').select('*')

        const input = [
            {
                owner: usersInDB[0].id,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            },
            {
                owner: usersInDB[0].id,
                reward_type: 'badge2',
                reward: 'testbadge2.jpg'
            },
            {
                owner: usersInDB[1].id,
                reward_type: 'avatar',
                reward: 'avatar1.jpg'
            }
        ]

        for(const reward of input){
            await Reward.add(reward, trx)
        }

        const result = await Reward.getUserRewards(usersInDB[0].id, trx)

        expect(result.length).toBe(2)
        expect(result[0].reward_type).toBe(input[0].reward_type)
        expect(result[0].reward).toBe(input[0].reward)

        expect(result[1].reward_type).toBe(input[1].reward_type)
        expect(result[1].reward).toBe(input[1].reward)
    })
})