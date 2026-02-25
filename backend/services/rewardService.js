import Reward from "../models/reward.js"

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
    }
}

export default RewardService