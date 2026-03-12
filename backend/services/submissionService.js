import Submission from '../models/submission.js'

const SubmissionService = {
    async createSubmission({ user, question, answer, completedLevel }){
        const exists = await Submission.getSpecific(user, question, completedLevel)
        if(exists){
            const err = new Error('User has already submitted this question on this level')
            err.status = 400
            throw err
        }
        return Submission.create({
            user,
            question,
            answer,
            completedLevel
        })
    },

    async getSpecificUser(user){
        const submissions = await Submission.getAllBasedOnUser(user)
        if(!submissions){
            const err = new Error('User has no submissions')
            err.status = 404
            throw err
        }
        return submissions
    },

    async getById(id){
        const submission = await Submission.getById(id)
        if(!submission){
            const err = new Error('Submission not found')
            err.status = 404
            throw err
        }
        return submission
    },

    async deleteSubmission(id){
        const submission = await Submission.getById(id)
        if(!submission){
            const err = new Error('Submission not found')
            err.status = 404
            throw err
        }
        await Submission.remove(id)
    }
}

export default SubmissionService