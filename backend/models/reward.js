import db from '../db/db.js'

const Reward = {
    async add({ owner, reward_type, reward }){
        return db('rewards')
            .insert({ owner, reward_type, reward })
            .returning('*')
    },

    async getByRewardAndUser(owner, reward){
        console.log('owner: ', owner)
        console.log('reward: ', reward)
        return db('rewards')
            .select('owner', 'reward_type', 'reward')
            .where({ owner:Number(owner), reward:String(reward) })
            .first()
    }

}

export default Reward