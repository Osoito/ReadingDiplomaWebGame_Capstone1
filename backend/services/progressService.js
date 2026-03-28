import Progress from '../models/progress.js'

const ProgressService = {
    async addNewProgress({ level, user, book }) {
        const existing = await Progress.findSpecificEntry(level, user)
        if (existing) {
            const err = new Error(`This user already has a progress entry for level ${level}`)
            err.status = 400
            throw err
        }

        return Progress.create({
            level,
            user,
            book,
            current_progress: 0,
            level_status: 'incomplete'
        })
    },

    async completeLevel(level, { user }) {
        const existing = await Progress.findSpecificEntry(level, user)
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
        const found = await Progress.findByUser(user)
        if (!found) {
            const err = new Error(`No progress entries found for this user`)
            err.status = 404
            throw err
        }
        return found
    },

    async findSpecificEntry(level, user) {
        const found = await Progress.findSpecificEntry(level, user)
        if (!found) {
            const err = new Error(`Level:  ${level} has no entry for this user`)
            err.status = 404
            throw err
        }
        return found
    },

    async getCurrentLevel(user) {
        const found = await Progress.getCurrentLevel(user)
        if (!found) {
            const err = new Error(`Was not able to fetch the current level for this user`)
            err.status = 404
            throw err
        }
        return found
    },

    async getLatestCompletedLevel(user) {
        const found = await Progress.findLatestCompletedLevel(user)
        if (!found) {
            const err = new Error('Could not find any completed levels for this user')
            err.userDetails = 'Käyttäjä ei ole suorittanut yhtään tasoa'
            err.status = 400
            throw err
        }
        return found
    },

    async changeBookinEntry(level, user, { book }) {
        const found = await Progress.findSpecificEntry(level, user)
        if (!found) {
            const err = new Error(`Level:  ${level} has no entry for this user`)
            err.status = 404
            throw err
        }
        return Progress.changeBookinEntry(level, user, book)
    },

    async getAllProgress() {
        return Progress.getAll()
    }
}

export default ProgressService