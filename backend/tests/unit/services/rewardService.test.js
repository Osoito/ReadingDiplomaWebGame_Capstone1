import { vi, test, expect } from 'vitest'
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


})