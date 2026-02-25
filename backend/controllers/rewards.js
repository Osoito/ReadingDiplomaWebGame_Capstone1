import express from 'express'
const rewardsRouter = express.Router()
import RewardService from '../services/rewardService.js'
import { z } from 'zod'
import middleware from '../utils/middleware.js'

const rewardAddSchema = z.object({
    owner: z.number(),
    reward_type: z.string(),
    reward: z.string()
}).strict()

rewardsRouter.post('/add-reward', middleware.requireAuthentication(true), middleware.zValidate(rewardAddSchema), async(request, response, next) => {
    const { owner, reward_type, reward } = request.validated

    try{
        const newReward = {
            owner,
            reward_type,
            reward
        }
        await RewardService.addReward(newReward)
        response.status(201).json(newReward)
    }catch(error){
        next(error)
    }
})

export default rewardsRouter