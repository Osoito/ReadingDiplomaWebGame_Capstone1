import { test, expect, describe } from 'vitest'
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
        expect(result[0].name).toStrictEqual('John')
        expect(result[0].email).toStrictEqual('john@doe.com')
        expect(result[1].name).toStrictEqual('Alice')
        expect(result[1].email).toStrictEqual('alice@doe.com')
    })

    test('Finding user by name', async() => {
        const users = [{
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

        const input = 'John'

        for(const user of users){
            await User.create(user, trx)
        }

        const usersInDb = await User.getAll(trx)

        const expectedOutcome = {
            id: usersInDb[0].id,
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            role: 'teacher'//,
            //teacher_id: null
        }


        const result = await User.findByName(input, trx)
        expect(result).toStrictEqual(expectedOutcome)

        expect(result.name).toStrictEqual(expectedOutcome.name)
        expect(result.email).toStrictEqual(expectedOutcome.email)
    })

    test('Find user by email', async() => {
        const users = [{
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

        const input = 'john@doe.com'

        for(const user of users){
            await User.create(user, trx)
        }

        const usersInDb = await User.getAll(trx)

        const expectedOutcome = {
            id: usersInDb[0].id,
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            role: 'teacher'//,
            //teacher_id: null
        }


        const result = await User.findByEmail(input, trx)
        expect(result).toStrictEqual(expectedOutcome)

        expect(result.name).toStrictEqual(expectedOutcome.name)
        expect(result.email).toStrictEqual(expectedOutcome.email)
    })

    test('Find user by id', async() => {
        const users = [{
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

        for(const user of users){
            await User.create(user, trx)
        }

        const usersInDb = await User.getAll(trx)

        const input = usersInDb[0].id

        const expectedOutcome = {
            id: usersInDb[0].id,
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'secret',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            role: 'teacher',
            teacher_id: null
        }


        const result = await User.findUserById(input, trx)
        expect(result).toStrictEqual(expectedOutcome)

        expect(result.name).toStrictEqual(expectedOutcome.name)
        expect(result.email).toStrictEqual(expectedOutcome.email)
    })

    test('Updated user role', async() => {
        const users = [{
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

        for(const user of users){
            await User.create(user, trx)
        }

        const usersInDb = await User.getAll(trx)

        const userid = usersInDb[1].id
        const userRole = 'teacher'

        const expectedOutcome = [{
            id: userid,
            email: 'alice@doe.com',
            name: 'Alice',
            password_hash: 'sekret',
            avatar: 'avatar2.jpg',
            currently_reading: null,
            grade: 2,
            role: 'teacher',
            teacher_id: null
        }]

        const result = await User.updateUserRole(userid, userRole, trx)

        expect(result).toStrictEqual(expectedOutcome)
    })

    test('Update user password', async() => {
        const users = [{
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

        for(const user of users){
            await User.create(user, trx)
        }

        const usersInDb = await User.getAll(trx)

        const newPass = 'new secret'
        const userId = usersInDb[0].id

        const expectedOutcome = [{
            id: userId,
            email: 'john@doe.com',
            name: 'John',
            password_hash: newPass,
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            role: 'teacher',
            teacher_id: null
        }]

        const result = await User.updateUserPassword(userId, newPass, trx)

        expect(result).toStrictEqual(expectedOutcome)
    })

    test('Create federated credentials', async() =>  {
        const users = [{
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

        for(const user of users){
            await User.create(user, trx)
        }

        const usersInDb = await User.getAll(trx)

        const userId = usersInDb[0].id
        const provider = 'google'
        const providerUsrId = '12345678'

        const result = await User.createFederatedCredentials(userId, provider, providerUsrId, trx)

        const federatedInDb = await trx('federated_credentials').select('*')

        const expectedOutcome = [{
            id: federatedInDb[0].id,
            user_id: userId,
            provider: provider,
            provider_user_id: '12345678'
        }]

        expect(result).toStrictEqual(expectedOutcome)
    })

    test('Find federated credentials', async() => {
        const users = [{
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

        for(const user of users){
            await User.create(user, trx)
        }

        const usersInDb = await User.getAll(trx)

        const federated_credentials = [{
            user_id: usersInDb[0].id,
            provider: 'google',
            provider_user_id: '12345678'
        },
        {
            user_id: usersInDb[1].id,
            provider: 'google',
            provider_user_id: '123456789'
        }]

        for(const federated_user of federated_credentials){
            await User.createFederatedCredentials(federated_user.user_id, federated_user.provider, federated_user.provider_user_id, trx)
        }

        const result = await User.findFederatedCredentials('google', 12345678, trx)

        const federatedInDb = await trx('federated_credentials').select('*')

        const expectedOutcome = {
            id: federatedInDb[0].id,
            user_id: usersInDb[0].id,
            provider: 'google',
            provider_user_id: '12345678'
        }

        expect(result).toStrictEqual(expectedOutcome)
    })
})