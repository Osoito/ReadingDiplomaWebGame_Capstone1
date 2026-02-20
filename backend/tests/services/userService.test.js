import { vi, test, expect } from 'vitest'
import User from '../../models/user.js'
import userService from '../../services/userService.js'
import bcrypt from 'bcrypt'

// Mock the whole user model
//vi.mock('../../models/user.js')

// Mock the required functions from user model
vi.mock('../../models/user.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual,
            findByName: vi.fn(),
            findByEmail: vi.fn(),
            create: vi.fn()
        }
    }
})

// Mock bcrypt.hash
vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('mocked_hash')
    }
}))

test('register hashes password and calls model correctly', async () => {
    const input = {
        email: 'john@doe.com',
        name: 'John',
        password: 'secret',
        avatar: 'avatars/avatar1.jpg',
        currently_reading: null,
        grade: 1,
        role: 'student'
    }

    User.create.mockResolvedValue(
        {
            id: 1,
            email: 'john@doe.com',
            name: 'John',
            password_hash: 'mocked_hash',
            avatar: 'avatar1.jpg',
            currently_reading: null,
            grade: 1,
            role: 'student'
        }
    )

    const result = await userService.register(input)

    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 12)

    expect(User.create).toHaveBeenCalledWith({
        email: 'john@doe.com',
        name: 'John',
        password_hash: 'mocked_hash',
        avatar: 'avatars/avatar1.jpg',
        currently_reading: null,
        grade: 1,
        role: 'student'
    })

    expect(result.password_hash).toBe('mocked_hash')
})