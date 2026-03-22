import express from 'express'
const submissionsRouter = express.Router()
import SubmissionService from '../services/submissionService.js'
import ProgressService from '../services/progressService.js'
import { z } from 'zod'
import middleware from '../utils/middleware.js'

const submissionAddSchema = z.object({
    question1: z.string(),
    answer1: z.string(),
    question2: z.string(),
    answer2: z.string(),
    question3: z.string(),
    answer3: z.string()
}).strict()


submissionsRouter.post('/add-submission', middleware.requireAuthentication(true), middleware.zValidate(submissionAddSchema), async (request, response, next) => {
    const { question1, answer1, question2, answer2, question3, answer3 } = request.validated
    const currentLevel = await ProgressService.getCurrentLevel(request.user.id)
    const completedLevel = currentLevel.id
    try {
        const newSubmission = {
            user: request.user.id,
            question1,
            answer1,
            completedLevel: completedLevel,
            question2,
            answer2,
            question3,
            answer3
        }
        await SubmissionService.createSubmission(newSubmission)
        response.status(201).json(newSubmission)
    } catch (error) {
        next(error)
    }
})

submissionsRouter.get('/my-students/:id', middleware.requireTeacherRole, async (request, response, next) => {
    const id = request.params.id

    try {
        const submission = await SubmissionService.getById(id)
        response.status(200).json(submission)
    } catch (error) {
        next(error)
    }
})

submissionsRouter.delete('/:id', middleware.requireTeacherRole, async (request, response, next) => {
    const id = request.params.id

    try {
        await SubmissionService.deleteSubmission(id)
        response.status(200).json('Submission deleted successfully')
    } catch (error) {
        next(error)
    }
})

submissionsRouter.get('/my-students', middleware.requireTeacherRole, async (request, response, next) => {
    try {
        const submissions = await SubmissionService.getSubmissionsForTeacher(request.user.id)
        response.status(200).json(submissions)
    } catch (error) {
        next(error)
    }
})

export default submissionsRouter