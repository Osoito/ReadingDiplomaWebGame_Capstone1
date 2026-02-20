import Progress from '../models/progress.js'

const ProgressService = {
    async addNewProgress({ level, user, book }) {
        //console.log('Level id: ', level)
        //console.log('User id: ', user)
        const existing = await Progress.findByLevel(level,user)
        //console.log(existing)
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

    async completeLevel( level,{ user }){
        //console.log('Level id: ', level)
        //console.log('User id: ', user)
        const existing = await Progress.findByLevel(level, user)
        if(!existing){
            const err = new Error('Level not found')
            err.name = 'NotFound'
            err.message = 'Level not found'
            err.status = 404
            throw err
        }
        if(existing.level_status === 'complete'){
            const err = new Error('Level already completed')
            err.name = 'LevelAlreadyComplete'
            err.message = 'Level already completed'
            err.status = 500
            throw err
        }
        try {
            return Progress.completeLevel(level, user)
        } catch(error){
            const err = new Error('Failed to mark level as complete')
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