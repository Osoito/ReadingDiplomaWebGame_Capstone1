import Reward from '../models/reward.js'

const RewardService = {
    async addReward({ owner, reward_type, reward }) {
        const existing = await Reward.getByRewardAndUser(owner, reward)
        if (existing) {
            const err = new Error('User already has this reward')
            err.status = 400
            throw err
        }
        return Reward.add({
            owner,
            reward_type,
            reward
        })
    },

    async getUserRewards(owner) {
        const rewards = await Reward.getUserRewards(owner)
        if (!rewards) {
            const err = new Error('No rewards found for this user')
            err.status = 404
            throw err
        }
        return rewards
    }
}

export default RewardService