import ProgressService from '../services/progressService.js'
import express from 'express'
const progressRouter = express.Router()


// for input validation
import { z } from 'zod'
import middleware from '../utils/middleware.js'

//const statusTypes = z.enum(['incomplete', 'complete'])

const addNewProgressSchema = z.object({
    user: z.number(),
    book: z.number()
}).strict()

progressRouter.post('/add-entry', middleware.requireAuthentication(true), middleware.zValidate(addNewProgressSchema), async(request, response, next) => {
    const { user, book } = request.validated

    try{
        console.log('user at point 1: ', user)
        console.log('book at point 1: ', book)
        const newEntry = {
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
