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
    let completedLevelId
    /**
     * Works, but is currently prone to a user caused bug.
     * To prevent this, the completed level (number between 1 and 8) should be sent from the frontend as a parameter
     * An even better alternative would be for the user to not be able to access a new level,
     * until the quiz of the previous level has been submitted.
     *
     * The completedLevel in the submission currently gets the latest completedLevel, for that field,
     * but if the user doesn't submit the quiz after completing the level and completes another level instead
     * then sends the quiz for the new level and later comes back to submit the previous level,
     * the associated completedLevel will be wrong
     *
     * There is also a bug where if the user doesn't submit the quiz of the first level after completing it and logs out instead,
     * Then when the user logs back in, the levels have been reset and when trying to complete the first level again
     * it prompts the quiz and submitting it does nothing so a new level can't be accessed.
     * Closing and reopening the tab seems to fix this as it resets all the progress on the phaser side.
     */
    if (!request.params?.level) {
        const completedLevel = await ProgressService.getLatestCompletedLevel(request.user.id)
        completedLevelId = completedLevel.id
    } else {
        completedLevelId = request.params.level
    }

    try {
        const newSubmission = {
            user: request.user.id,
            question1,
            answer1,
            completedLevel: completedLevelId,
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

submissionsRouter.get('/my-students', middleware.requireTeacherRole, async (request, response, next) => {
    try {
        const submissions = await SubmissionService.getSubmissionsForTeacher(request.user.id)
        response.status(200).json(submissions)
    } catch (error) {
        next(error)
    }
})

export default submissionsRouter