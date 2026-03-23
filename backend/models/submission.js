import db from '../db/db.js'

const Submission = {
    async create({ user, question1, answer1, completedLevel, question2, answer2, question3, answer3 }, dbConn = db) {
        user = Number(user)
        completedLevel = Number(completedLevel)
        return dbConn('submissions')
            .insert({ user:user, question1:question1, answer1:answer1, completedLevel:completedLevel, question2:question2, answer2:answer2, question3:question3, answer3:answer3 })
            .returning('*')
    },

    async getAll(dbConn = db){
        return dbConn('submissions')
            .select('id', 'user', 'question1', 'answer1', 'completedLevel', 'question2', 'answer2', 'question3', 'answer3')
    },

    async getAllBasedOnUser(user, dbConn = db){
        return dbConn('submissions')
            .select('user', 'question1', 'answer1', 'completedLevel', 'question2', 'answer2', 'question3', 'answer3')
            .where({ user })
    },

    async getSpecific(user, completedLevel, dbConn = db){
        return dbConn('submissions')
            .select('user', 'question1', 'answer1', 'completedLevel', 'question2', 'answer2', 'question3', 'answer3')
            .where({ user:user, completedLevel:completedLevel })
            .first()
    },

    async getById(id, teacher_id, dbConn = db){
        return dbConn('submissions')
            .innerJoin('users', 'submissions.user', 'users.id')
            .select('submissions.user', 'submissions.question1', 'submissions.answer1', 'submissions.completedLevel', 'submissions.question2', 'submissions.answer2', 'submissions.question3', 'submissions.answer3')
            .where('submissions.id', id)
            .andWhere('users.teacher_id', teacher_id)
            .first()
    },

    async remove(id, dbConn = db){
        return dbConn('submissions')
            .where({ id })
            .del()
    },

    async getSubmissionsForTeacher(id, dbConn = db){
        return dbConn('submissions')
            .innerJoin('users', 'submissions.user', 'users.id')
            .select('submissions.user', 'submissions.question1', 'submissions.answer1', 'submissions.completedLevel', 'submissions.question2', 'submissions.answer2', 'submissions.question3', 'submissions.answer3', 'users.name')
            .where('users.teacher_id', id)
    }
}

export default Submission