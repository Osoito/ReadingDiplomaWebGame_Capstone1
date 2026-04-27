import Submission from '../models/submission.js'

const SubmissionService = {
    async createSubmission({ user, question1, answer1, completedLevel, question2, answer2, question3, answer3 }) {
        const exists = await Submission.getSpecific(user, completedLevel)
        if (exists) {
            const err = new Error('User has already submitted this question on this level')
            err.status = 400
            throw err
        }
        return Submission.create({
            user,
            question1,
            answer1,
            completedLevel,
            question2,
            answer2,
            question3,
            answer3
        })
    },

    //apparently not used anywhere yet
    async getSpecificUser(user) {
        const submissions = await Submission.getAllBasedOnUser(user)
        if (!submissions) {
            const err = new Error('User has no submissions')
            err.status = 404
            throw err
        }
        return submissions
    },

    async findByUserAndTeacher({ userId, teacherId }) {
        const submissions = await Submission.getSubmissionsForTeacherByStudent(userId, teacherId)
        if (!submissions || submissions.length === 0) {
            const err = new Error(`No submission entries found for this student or student isn't under this teacher`)
            err.userDetails = 'Opettaja ei opeta tätä opiskelijaa tai opiskelija ei ole vastannut yhdenkään tason kysymyksiin'
            err.status = 404
            throw err
        }
        return submissions
    },

    async findByUser(userId) {
        const submissions = await Submission.findByUser(userId)
        if (!submissions || submissions.length === 0) {
            const err = new Error(`No submission entries found for this user`)
            err.userDetails = 'Et ole vastannut yhdenkään tason kysymyksiin'
            err.status = 404
            throw err
        }
        return submissions
    },

    async getById(id, teacher_id) {
        const submission = await Submission.getById(id, teacher_id)
        if (!submission) {
            const err = new Error('Submission not found')
            err.status = 404
            throw err
        }
        return submission
    },

    async deleteSubmission(id, teacher_id) {
        const submission = await Submission.getById(id, teacher_id)
        if (!submission) {
            const err = new Error('Submission not found')
            err.status = 404
            throw err
        }
        await Submission.remove(id)
    },

    async getSubmissionsForTeacher(id) {
        const submissions = await Submission.getSubmissionsForTeacher(id)
        if (!submissions) {
            const err = new Error('No submissions for this teacher')
            err.status = 404
            throw err
        }
        return submissions
    }
}

export default SubmissionService