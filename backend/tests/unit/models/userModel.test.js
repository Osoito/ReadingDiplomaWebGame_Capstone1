import { test, expect, assert } from 'vitest'
import knex from 'knex'
import config from '../../../knexfile.js'

const db = knex(config.test_Unit)
let trx

// runs before every test
beforeEach(async () => {
    trx = await db.transaction()
})

// runs after every test
afterEach(async () => {
    await trx.rollback()
})

test('User model can insert multiple users', async () => {
    const input = [{
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

    await trx('users').insert(input)

    const result = await trx('users').select('*')

    expect(result.length).toBe(2)
    assert.strictEqual(result[0].name, 'John')
    assert.strictEqual(result[0].email, 'john@doe.com')
    assert.strictEqual(result[1].name, 'Alice')
    assert.strictEqual(result[1].email, 'alice@doe.com')
})