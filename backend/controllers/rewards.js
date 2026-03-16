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

rewardsRouter.get('/:id', middleware.requireTeacherRole, async(request, response, next) => {
    const id = request.params.id

    try{
        const rewards = await RewardService.getUserRewards(id)
        response.status(200).json(rewards)
    } catch(error){
        next(error)
    }
})

rewardsRouter.get('/', middleware.requireAuthentication(true), async(request, response, next) => {
    try {
        const rewards = await RewardService.getUserRewards(request.user.id)
        response.status(200).json(rewards)
    } catch(error){
        next(error)
    }
})

export default rewardsRouter