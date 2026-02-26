import Reward from '../models/reward.js'

const RewardService = {
    async addReward({ owner, reward_type, reward }){
        const existing = await Reward.getByRewardAndUser(owner, reward)
        if(existing){
            const err = new Error('User already has this reward')
            err.name = 'ValidationError'
            err.status = 400
            throw err
        }
        try{
            return Reward.add({
                owner,
                reward_type,
                reward
            })
        } catch(error){
            const err = new Error('Failed to add a reward')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    },

    async getUserRewards(owner){
        try{
            const rewards = await Reward.getUserRewards(owner)
            if(!rewards){
                const err = new Error('No rewards found for user')
                err.name = 'NotFound'
                err.status = 404
                throw err
            }
            return rewards
        } catch(error){
            const err = new Error('Failed to get rewards')
            err.name = 'DatabaseError'
            err.message = error.message
            err.status = 500
            throw err
        }
    }
}

export default RewardService