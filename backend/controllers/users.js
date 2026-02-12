import express from 'express'
const usersRouter = express.Router()
import UserService from '../services/userService.js'
import { z } from 'zod'
import middleware from '../utils/middleware.js'
const roles = z.enum(['student', 'teacher', 'principal'])

const userUpdateSchema = z.object({
    email: z.email(),
    name: z.string(),
    // Makes sure the password includes at least 5 letters, 1 upper -and lowercase letter and a special character
    password: z.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/),
    avatar: z.string(),
    currently_reading: z.number().int().positive(),
    grade: z.number(),
    role: z.string().transform(str => str.toLowerCase()).pipe(roles)
}).strict()


const userRegisterSchema = z.object({
    email: z.email(),
    name: z.string(),
    password: z.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/),
    avatar: z.string(),
    grade: z.number(),
}).strict()
//.strict() means that anything not defined here causes an error.
// The missing values should be filled by default values in the service.
// We still need to figure out how the password should be when a user signs up with a Google

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await UserService.getAllUsers()
        response.json(users)
    } catch (error) {
        next(error)
    }
})

usersRouter.post('/register', middleware.zValidate(userRegisterSchema), async (request, response, next) => {
    const { email, name, password, avatar, currently_reading, grade, role } = request.validated

    try {
        const newUser = {
            email,
            name,
            password,
            avatar,
            currently_reading,
            grade,
            role
        }

        await UserService.register(newUser)
        response.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
})

// Uncomment the middleware once the update request works, for input validation.
// For updating user profile. Needs to check if the user has needsOnboarding
// Should have a check for the role of the user doing the request to update role

usersRouter.patch('/:id/role', middleware.requireTeacherRole, middleware.zValidate(userUpdateSchema), async (request, response, next) => {
    try {
        const { id } = request.params
        const user = await UserService.findById(id)
        await UserService.updateUserRole(id, user.role)
        const updatedUser = await UserService.findById(id)
        response.status(201).json(updatedUser)
    } catch (error) {
        next(error)
    }
})

usersRouter.get('/:id', async (request, response, next) => {
    try {
        const user = await UserService.findById(request.params.id)
        response.json(user)
    } catch (error) {
        next(error)
    }
})

export default usersRouter