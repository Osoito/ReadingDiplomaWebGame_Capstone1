import ProgressService from '../services/progressService.js'
import express from 'express'
const progressRouter = express.Router()


// for input validation
import { z } from 'zod'
import middleware from '../utils/middleware.js'

//const statusTypes = z.enum(['incomplete', 'complete'])

const addNewProgressSchema = z.object({
    level: z.number(),
    user: z.number(),
    book: z.number()
}).strict()

progressRouter.post('/add-entry', middleware.requireAuthentication(true), middleware.zValidate(addNewProgressSchema), async(request, response, next) => {
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


export default progressRouter
