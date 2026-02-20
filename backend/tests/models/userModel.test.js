import db from '../../db/db.js'

let trx

beforeEach(async () => {
    trx = await db.transaction()
})

afterEach(async () => {
    await trx.rollback()
})

test('insert multiple users', async () => {
    const input = [{
        email: 'john@doe.com',
        name: 'John',
        password_hash: 'secret',
        avatar: 'avatar1.jpg',
        currently_reading: null,
        grade: 1
    },
    {
        email: 'alice@doe.com',
        name: 'Alice',
        password_hash: 'sekret',
        avatar: 'avatar2.jpg',
        currently_reading: null,
        grade: 2
    }]

    await trx('users').insert(input)

    const result = await trx('users').select('*')
    expect(result.length).toBe(2)
})