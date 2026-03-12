import db from '../db/db.js'

const Submission = {
    async create({ user, question, answer, completedLevel }) {
        user = Number(user)
        completedLevel = Number(completedLevel)
        return db('submissions')
            .insert({ user:user, question:question, answer:answer, completedLevel:completedLevel })
            .returning('*')
    },

    async getAll(){
        return db('submissions')
            .select('user', 'question', 'answer', 'completedLevel')
    },

    async getAllBasedOnUser(user){
        return db('submissions')
            .select('user', 'question', 'answer', 'completedLevel')
            .where({ user })
    },

    async getSpecific(user, question, completedLevel){
        return db('submissions')
            .select('user', 'question', 'answer', 'completedLevel')
            .where({ user:user, question:question, completedLevel:completedLevel })
            .first()
    },

    async getById(id){
        return db('submissions')
            .select('user', 'question', 'answer', 'completedLevel')
            .where({ id })
            .first()
    },

    async remove(id){
        return db('submissions')
            .where({ id })
            .del()
    }
}

export default Submission