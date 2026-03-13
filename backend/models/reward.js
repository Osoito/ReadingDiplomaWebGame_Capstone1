import db from '../db/db.js'

const Reward = {
    async add({ owner, reward_type, reward }, dbConn = db){
        return dbConn('rewards')
            .insert({ owner, reward_type, reward })
            .returning('*')
    },

    async getByRewardAndUser(owner, reward, dbConn = db){
        return dbConn('rewards')
            .select('owner', 'reward_type', 'reward')
            .where({ owner:Number(owner), reward:String(reward) })
            .first()
    },

    async getUserRewards(owner, dbConn = db){
        return dbConn('rewards')
            .select('reward_type', 'reward')
            .where({ owner: owner })
    }

}

export default Reward