import ProgressService from '../services/progressService.js'
import express from 'express'
const progressRouter = express.Router()


// for input validation
import { z } from 'zod'
import middleware from '../utils/middleware.js'

//const statusTypes = z.enum(['incomplete', 'complete'])

const ProgressSchema = z.object({
    level: z.number(),
    user: z.number()//,book: z.number()
}).strict()

const LevelCompleteSchema = z.object({
    user: z.number()
}).strict()

const addBookToEntrySchema = z.object({
    book: z.number()
}).strict()

progressRouter.get('/', middleware.requireAuthentication(true), async (request, response, next) => {
    try {
        const progress = await ProgressService.findByUser(request.user.id)
        response.status(200).json(progress)
    } catch (error) {
        next(error)
    }
})

// Gets progress entries for a specific student under the teacher making the request
progressRouter.get('/student/:id', middleware.requireTeacherRole, async (request, response, next) => {
    try {
        const progress = await ProgressService.findByUserAndTeacher({ userId: request.params.id, teacherId: request.user.id })
        response.status(200).json(progress)
    } catch (error) {
        next(error)
    }
})

progressRouter.get('/get-entry/:level', middleware.requireAuthentication(true), async (request, response, next) => {
    const level = request.params.level
    try {
        const progress = await ProgressService.findSpecificEntry(level, request.user.id)
        response.status(200).json(progress)
    } catch (error) {
        next(error)
    }
})

progressRouter.get('/current-level', middleware.requireAuthentication(true), async (request, response, next) => {
    try {
        //console.log(request.user.id)
        const progress = await ProgressService.getCurrentLevel(request.user.id)
        response.status(200).json(progress)
    } catch (error) {
        next(error)
    }
})

//Might not be necessary anymore in the final version, since all entries are automatically created when an account is created.
progressRouter.post('/add-entry', middleware.requireAuthentication(true), middleware.zValidate(ProgressSchema), async (request, response, next) => {
    const { level, user, book } = request.validated

    try {
        const newEntry = {
            level,
            user,
            book
        }
        const progressEntry = await ProgressService.addNewProgress(newEntry)
        response.status(201).json(progressEntry)
    } catch (error) {
        next(error)
    }
})

progressRouter.put('/:level/completed', middleware.requireAuthentication(true), middleware.zValidate(LevelCompleteSchema), async (request, response, next) => {
    const level = request.params.level
    const { user } = request.validated

    try {
        await ProgressService.completeLevel(level, { user })
        response.status(200).json('Level marked as completed successfully!')
    } catch (error) {
        next(error)
    }
})

progressRouter.put('/:level/add-book', middleware.requireAuthentication(true), middleware.zValidate(addBookToEntrySchema), async (request, response, next) => {
    const level = request.params.level
    const { book } = request.validated

    try {
        await ProgressService.changeBookinEntry(level, request.user.id, { book })
        response.status(200).json('Book added to entry successfully!')
    } catch (error) {
        next(error)
    }
})


export default progressRouter
