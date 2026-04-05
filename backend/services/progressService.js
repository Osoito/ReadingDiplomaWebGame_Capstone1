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

    async changeLevelStatus(level, { user, status, teacherId }) {
        // Check that the teacher is the teacher of the student for this level
        const entry = await Progress.findSpecificEntryByUserAndTeacher(level, user, teacherId)
        if (!entry) {
            const err = new Error(`No progress entry found for this student, level, and teacher combination`)
            err.userDetails = 'Opettaja ei opeta tätä opiskelijaa tai opiskelija ei ole suorittanut tätä tasoa'
            err.status = 400
            throw err
        }
        if (entry.level_status === status) {
            const translate = status === 'complete'
                ? 'suoritettu'
                : status === 'incomplete'
                    ? 'suorittamaton'
                    : 'arvioitu'
            const err = new Error(`Level status is already ${status}.`)
            err.userDetails = `Taso on jo ${translate}`
            err.status = 400
            throw err
        }

        // Result is returned as an array, it's destructurized into an object here
        const [updatedProgress] = await Progress.changeLevelStatus(level, user, status)
        return updatedProgress
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

    async findByUserAndTeacher({ userId, teacherId }) {
        const found = await Progress.findByUserAndTeacher(userId, teacherId)
        if (!found || found.length === 0) {
            const err = new Error(`No progress entries found for this student, being taught by this teacher`)
            err.userDetails = 'Opettaja ei opeta tätä opiskelijaa tai opiskelija ei ole suorittanut yhtään tasoa'
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