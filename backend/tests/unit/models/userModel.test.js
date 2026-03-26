import { test, expect, assert, describe } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'
import User from '../../../models/user.js'

const db = knex(config.test_Unit)
let trx



describe('User model tests', () => {
    // runs before every test
    beforeEach(async () => {
        trx = await db.transaction()
    })

    // runs after every test
    afterEach(async () => {
        await trx.rollback()
    })

    test('User model can insert multiple users and then fetch them', async () => {
        const input = [{
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            role: 'teacher',
            teacher_id: null
        },
        {
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            role: 'student',
            teacher_id: null
        }]

        for(const user of input){
            await User.create(user, trx)
        }

        const result = await User.getAll(trx)

        expect(result.length).toBe(2)
        assert.strictEqual(result[0].name, 'John')
        assert.strictEqual(result[0].email, 'john@doe.com')
        assert.strictEqual(result[1].name, 'Alice')
        assert.strictEqual(result[1].email, 'alice@doe.com')
    })

})