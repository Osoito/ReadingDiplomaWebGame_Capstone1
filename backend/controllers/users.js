import express from 'express'
const usersRouter = express.Router()
import UserService from '../services/userService.js'
import { z } from 'zod'
import middleware from '../utils/middleware.js'
import bcrypt from 'bcrypt'
import ProgressService from '../services/progressService.js'

const userRegisterSchema = z.object({
    email: z.email(),
    name: z.string(),
    password: z.string().min(8),
    avatar: z.string(),
    grade: z.number(),
}).strict()

const userUpdatePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    password: z.string().min(8)
}).strict()
//.strict() means that anything not defined here causes an error.
// The missing values should be filled by default values in the service.
// We still need to figure out how the password should be when a user signs up with a Google

const studentCreateSchema = z.object({
    name: z.string().min(3),
    password: z.string().min(3),
}).strict()

// Must be defined BEFORE /:id route
usersRouter.get('/my-students', middleware.requireTeacherRole, async (request, response, next) => {
    try {
        const students = await UserService.getStudentsByTeacher(request.user.id)
        response.json(students)
    } catch (error) {
        next(error)
    }
})

usersRouter.post('/students', middleware.requireTeacherRole, middleware.zValidate(studentCreateSchema), async (request, response, next) => {
    try {
        const { name, password } = request.validated
        const student = await UserService.createStudent({
            name,
            password,
            teacherId: request.user.id
        })

        const levelAmount = 8
        for(let i = 1; i <= levelAmount; i++){
            await ProgressService.addNewProgress({
                level: i,
                user: student[0].id
            })
        }
        response.status(201).json(student)
    } catch (error) {
        next(error)
    }
})

usersRouter.delete('/students/:id', middleware.requireTeacherRole, async (request, response, next) => {
    try {
        const student = await UserService.findById(request.params.id)
        if (!student || student.teacher_id !== request.user.id) {
            return response.status(403).json({ error: 'Forbidden' })
        }
        await UserService.deleteStudent(request.params.id)
        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

usersRouter.get('/', middleware.requireAuthentication(true), async (request, response, next) => {
    try {
        const users = await UserService.getAllUsers()
        response.json(users)
    } catch (error) {
        next(error)
    }
})

usersRouter.post('/register', middleware.requireAuthentication(false), middleware.zValidate(userRegisterSchema), async (request, response, next) => {
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
        const createdUser = await UserService.register(newUser)
        const levelAmount = 8
        for(let i = 1; i <= levelAmount; i++){
            await ProgressService.addNewProgress({
                level: i,
                user: createdUser[0].id
            })
        }
        response.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
})

usersRouter.patch('/:id/role', middleware.requireTeacherRole, async (request, response, next) => {
    try {
        const { id } = request.params
        const user = await UserService.findById(id)
        const updatedUser = await UserService.updateUserRole(id, user.role)
        response.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
})

usersRouter.patch('/:id/change-password', middleware.requireAuthentication(true), middleware.zValidate(userUpdatePasswordSchema), async(request, response, next) => {
    try{
        const { id } = request.params
        if (request.user.id !== Number(id)) {
            return response.status(403).json({ error: 'Forbidden' })
        }
        const { currentPassword, password } = request.validated
        const user = await UserService.findById(id)
        const match = await bcrypt.compare(currentPassword, user.password_hash)
        if(!match){
            const err = new Error('Current password does not match')
            err.status = 400
            throw err
        }
        await UserService.updateUserPassword(id, password)
        response.status(201).json('Password changed successfully')
    } catch(error){
        next(error)
    }
})

/* Might need to remove/modify this route for security, since now anyone could use this route to get all the information of any user
usersRouter.get('/:id', middleware.requireAuthentication(true), async (request, response, next) => {
    try {
        const user = await UserService.findById(request.params.id)
        response.json(user)
    } catch (error) {
        next(error)
    }
})*/

export default usersRouter