import Progress from '../models/progress.js'

const ProgressService = {
    async addNewProgress({ level, user, book }) {
        const existing = await Progress.findByLevel(level,user)
        if (existing) {
            const err = new Error('This user already has a progress entry for this level')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }

        try {
            return Progress.create({
                level,
                user,
                book,
                current_page:0,
                level_status:'incomplete'
            })
        } catch (error) {
            const err = new Error('Failed to add a progress entry')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    async findByUser(user){
        return Progress.findByUser(user)
    },

    async getAllProgress() {
        return Progress.getAll()
    }
}

export default ProgressService