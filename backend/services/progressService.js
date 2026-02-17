import Progress from '../models/progress.js'

const ProgressService = {
    async addNewProgress({ user, book }) {
        console.log('user at point 2: ', user)
        console.log('book at point 2: ', book)
        const existing = await Progress.findByUser(user)
        if (existing) {
            const err = new Error('This user already has a progress entry')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }

        try {
            console.log('user at point 3: ', user)
            console.log('book at point 3: ', book)
            return Progress.create({
                level:1,
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