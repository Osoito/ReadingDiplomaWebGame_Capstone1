import express from 'express'
const usersRouter = express.Router()
import UserService from '../services/userService.js'

// -- Not 100% sure if this works yet v
/* -- for input validation, once requests work --
import { z } from 'zod'
import middleware from '../utils/middleware.js'
const roles = z.enum(['student', 'teacher', 'principal'])
const userUpdateSchema = z.object({
    name: z.string(),
    // Makes sure the password includes at least 5 letters, 1 upper -and lowercase letter and a special character
    password_hash: z.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/),
    avatar: z.string(),
    currently_reading: z.number().int().positive(),
    grade: z.number(),
    role: z.string().transform(str => str.toLowerCase()).pipe(roles)
}).strict()

const userPostSchema = z.object({
    name: z.string(),
    // Makes sure the password includes at least 5 letters, 1 upper -and lowercase letter and a special character
    password_hash: z.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/),
    avatar: z.string(),
    grade: z.number(),
}).strict()
//.strict() means that anything not defined here causes an error.
// The missing values should be filled by default values in the service.
// We still need to figure out how the password should be when a user signs up with a Google
// -- for input validation, once requests work --*/
// -- Not 100% sure if this works yet ^

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await UserService.getAllUsers()
        response.json(users)
    } catch (error) {
        next(error)
    }
})

// Uncomment the middleware once the post request works, for input validation.
usersRouter.post('/', /*middleware.zValidate(userPostSchema),*/ async (request, response, next) => {
    try {

    } catch (error) {
        next(error)
    }
})

// Uncomment the middleware once the update request works, for input validation.
// For updating user profile. Needs to check if the user has needsOnboarding
// Should have a check for the role of the user doing the request to update role
usersRouter.put('/', /*middleware.zValidate(userUpdateSchema),*/ async (request, response, next) => {
    try {

    } catch (error) {
        next(error)
    }
})

export default usersRouter