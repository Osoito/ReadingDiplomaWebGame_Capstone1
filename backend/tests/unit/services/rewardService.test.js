import { vi, test, expect, describe } from 'vitest'
import Reward from '../../../models/reward.js'
import RewardService from '../../../services/rewardService.js'


// Mock the required functions from rewards model
vi.mock('../../../models/reward.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual,
            add: vi.fn(),
            getByRewardAndUser: vi.fn(),
            getUserRewards: vi.fn()
        }
    }
})

describe('RewardService unit tests', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Add a reward', async() => {
        const input = {
            owner: 1,
            reward_type: 'badge',
            reward: 'testbadge.jpg'
        }

        Reward.add.mockResolvedValue(
            {
                id: 1,
                owner: 1,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            }
        )

        const result = await RewardService.addReward(input)

        expect(Reward.getByRewardAndUser).toBeCalledTimes(1)
        expect(Reward.add).toHaveBeenCalledWith(input)
        expect(Reward.add).toBeCalledTimes(1)

        expect(result.owner).toBe(input.owner)
        expect(result.reward_type).toBe(input.reward_type)
        expect(result.reward).toBe(input.reward)

    })

    test('Add a duplicate reward', async() => {
        const input = {
            owner: 1,
            reward_type: 'badge',
            reward: 'testbadge.jpg'
        }

        Reward.getByRewardAndUser.mockResolvedValue(input)

        await expect(RewardService.addReward(input))
            .rejects
            .toThrow('User already has this reward')

        expect(Reward.getByRewardAndUser).toBeCalledTimes(1)
        expect(Reward.getByRewardAndUser).toHaveBeenCalledWith(input.owner, input.reward)
        expect(Reward.add).not.toHaveBeenCalled()

    })

    test('Get all rewards for a specific user', async() => {
        const mockRewards = [
            {
                owner: 1,
                reward_type: 'badge',
                reward: 'testbadge.jpg'
            },
            {
                owner: 1,
                reward_type: 'badge2',
                reward: 'testbadge2.jpg'
            }
        ]

        Reward.getUserRewards.mockResolvedValue(mockRewards)

        const result = await RewardService.getUserRewards(1)

        expect(Reward.getUserRewards).toBeCalledTimes(1)
        expect(result).toEqual(mockRewards)
    })

    test('Try to get all rewards for user when there are no rewards', async() => {

        Reward.getUserRewards.mockResolvedValue(null)

        await expect(RewardService.getUserRewards(1))
            .rejects
            .toThrow('No rewards found for this user')

        expect(Reward.getUserRewards).toBeCalledTimes(1)
    })


})