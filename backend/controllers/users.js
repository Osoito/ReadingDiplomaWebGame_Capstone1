import express from 'express'
const usersRouter = express.Router()
import UserService from '../services/userService.js'

/* -- for error handling, once requests work --
// import { z } from 'zod'
// import middleware from '../utils/middleware.js'
// const roles = z.enum(['student', 'teacher', 'principal'])
const userSchema = z.object({
    name: z.string(),
    // Makes sure the password includes at least 5 letters, 1 upper -and lowercase letter and a special character
    password_hash: z.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/),
    avatar: z.string(),
    currently_reading: z.number().int().positive(),
    grade: z.number(),
    role: z.string().transform(str => str.toLowerCase()).pipe(roles)
}).strict()
// -- for error handling, once requests work --*/

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await UserService.getAllUsers()
        response.json(users)
    } catch (error) {
        next(error)
    }
})

// Uncomment the middleware once the post request works, for input validation.
usersRouter.post('/', /*middleware.zValidate(userSchema),*/ async (request, response, next) => {
    try {

    } catch (error) {
        next(error)
    }
})

// add more routes here



export default usersRouter