import express from 'express'
const submissionsRouter = express.Router()
import SubmissionService from '../services/submissionService.js'
import { z } from 'zod'
import middleware from '../utils/middleware.js'

const submissionSchema = z.strictObject({
    completedLevel: z.number(),
    question1: z.string(),
    answer1: z.string().min(3),
    question2: z.string(),
    answer2: z.string().min(3),
    question3: z.string(),
    answer3: z.string().min(3)
})

// Gets submission entries for the user making the request
submissionsRouter.get('/', middleware.requireAuthentication(true), async (request, response, next) => {
    try {
        const submissions = await SubmissionService.findByUser(request.user.id)
        response.status(200).json(submissions)
    } catch (error) {
        next(error)
    }
})

// update a submission entry for the user making the request
submissionsRouter.put('/', middleware.requireAuthentication(true), middleware.zValidate(submissionSchema), async (request, response, next) => {
    const { completedLevel, question1, answer1, question2, answer2, question3, answer3 } = request.validated

    try {
        const reSubmission = {
            user: request.user.id,
            completedLevel,
            question1,
            answer1,
            question2,
            answer2,
            question3,
            answer3
        }
        await SubmissionService.updateSubmission(reSubmission)
        response.status(200).json(reSubmission)
    } catch (error) {
        next(error)
    }
})

submissionsRouter.post('/add-submission', middleware.requireAuthentication(true), middleware.zValidate(submissionSchema), async (request, response, next) => {
    const { completedLevel, question1, answer1, question2, answer2, question3, answer3 } = request.validated
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
    const teacher_id = request.user.id
    try {
        const submission = await SubmissionService.getById(id, teacher_id)
        response.status(200).json(submission)
    } catch (error) {
        next(error)
    }
})

submissionsRouter.delete('/:id', middleware.requireTeacherRole, async (request, response, next) => {
    const id = request.params.id
    const teacher_id = request.user.id
    try {
        await SubmissionService.deleteSubmission(id, teacher_id)
        response.status(200).json('Submission deleted successfully')
    } catch (error) {
        next(error)
    }
})

// Gets submission entries for a specific student under the teacher making the request
submissionsRouter.get('/student/:id', middleware.requireTeacherRole, async (request, response, next) => {
    try {
        const submission = await SubmissionService.findByUserAndTeacher({ userId: request.params.id, teacherId: request.user.id })
        response.status(200).json(submission)
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