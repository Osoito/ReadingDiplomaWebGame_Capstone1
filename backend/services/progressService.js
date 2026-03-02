import Progress from '../models/progress.js'

const ProgressService = {
    async addNewProgress({ level, user, book }) {
        //console.log('Level id: ', level)
        //console.log('User id: ', user)
        const existing = await Progress.findByLevel(level, user)
        //console.log(existing)
        if (existing) {
            const err = new Error(`This user already has a progress entry for level ${level}`)
            err.status = 400
            throw err
        }

        return Progress.create({
            level,
            user,
            book,
            current_page: 0,
            level_status: 'incomplete'
        })
    },

    async completeLevel(level, { user }) {
        //console.log('Level id: ', level)
        //console.log('User id: ', user)
        const existing = await Progress.findByLevel(level, user)
        if (!existing) {
            const err = new Error(`Level ${level} was not found for this user`)
            err.status = 404
            throw err
        }
        if (existing.level_status === 'complete') {
            const err = new Error(`Level already completed`)
            err.status = 400
            throw err
        }
        return Progress.completeLevel(level, user)
    },

    async findByUser(user) {
        const found = Progress.findByUser(user)
        if (!found) {
            const err = new Error(`Progress entry was not found for this user`)
            err.status = 404
            throw err
        }
        return found
    },

    async getAllProgress() {
        return Progress.getAll()
    }
}

export default ProgressService