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

progressRouter.post('/add-entry', middleware.requireAuthentication(true), middleware.zValidate(ProgressSchema), async(request, response, next) => {
    const { level, user, book } = request.validated

    try{
        const newEntry = {
            level,
            user,
            book
        }
        await ProgressService.addNewProgress(newEntry)
        response.status(201).json(newEntry)
    } catch(error){
        next(error)
    }
})

progressRouter.put('/:level/completed', middleware.requireAuthentication(true), middleware.zValidate(LevelCompleteSchema), async(request, response, next) => {
    const level = request.params.level
    const { user } = request.validated

    try{
        await ProgressService.completeLevel(level, { user })
        response.status(201).json('Level marked as completed successfully')
    } catch(error){
        next(error)
    }
})


export default progressRouter
