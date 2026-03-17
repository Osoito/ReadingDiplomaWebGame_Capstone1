import { vi, test, expect, describe } from 'vitest'
import Progress from '../../../models/progress.js'
import ProgressService from '../../../services/progressService.js'

// Mock the required functions from progress model
vi.mock('../../../models/progress.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual,
            create: vi.fn(),
            findSpecificEntry: vi.fn(),
            completeLevel: vi.fn(),
            findByUser: vi.fn(),
            getCurrentLevel: vi.fn(),
            changeBookinEntry: vi.fn(),
            getAll: vi.fn()
        }
    }
})

describe('ProgressService related tests', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Add a progress entry', async () => {
        const input = {
            level: 1,
            user: 1,
            book: null
        }

        const expectedOutcome = {
            id: 1,
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        const expectedCall = {
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }
        Progress.create.mockResolvedValue(expectedOutcome)

        const result = await ProgressService.addNewProgress(input)

        expect(Progress.findSpecificEntry).toHaveBeenCalled(1)
        expect(Progress.create).toHaveBeenCalledWith(expectedCall)
        expect(Progress.create).toHaveBeenCalledTimes(1)

        expect(result).toStrictEqual(expectedOutcome)
    })

    test('Mark level as complete', async () => {
        const input = {
            user: 1
        }
        const level = 1
        const expectedOutcome = {
            id: 1,
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'complete'
        }
        Progress.findSpecificEntry.mockResolvedValue(
            {
                id: 1,
                level: 1,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        )
        Progress.completeLevel.mockResolvedValue(expectedOutcome)

        const result = await ProgressService.completeLevel(level, input)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(Progress.findSpecificEntry).toHaveBeenCalledWith(level, 1)
        expect(Progress.completeLevel).toHaveBeenCalledTimes(1)
        expect(Progress.completeLevel).toHaveBeenCalledWith(level, 1)
    })

    test('Find all users entries', async () => {
        const input = {
            user: 1
        }

        const expectedOutcome = {
            id: 1,
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        Progress.findByUser.mockResolvedValue(expectedOutcome)

        const result = await ProgressService.findByUser(input)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Progress.findByUser).toHaveBeenCalledTimes(1)
        expect(Progress.findByUser).toHaveBeenCalledWith(input)
    })

    test('Find specific entry', async () => {
        const input = {
            level:1,
            user: 1
        }

        const expectedOutcome = {
            id: 1,
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        Progress.findSpecificEntry.mockResolvedValue(expectedOutcome)

        const result = await ProgressService.findSpecificEntry(input.level, input.user)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(Progress.findSpecificEntry).toBeCalledWith(1, 1)
    })

    test('Get current level', async () => {
        const input = {
            user: 1
        }

        const expectedOutcome = {
            id: 1,
            level: 1,
            user: 1,
            book: null,
            current_progress: 0,
            level_status: 'incomplete'
        }

        Progress.getCurrentLevel.mockResolvedValue(expectedOutcome)

        const result = await ProgressService.getCurrentLevel(input.user)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Progress.getCurrentLevel).toHaveBeenCalledTimes(1)
        expect(Progress.getCurrentLevel).toBeCalledWith(1)
    })

    test('Change book in entry', async () => {
        const input = {
            book: 1
        }
        const level = 1
        const user = 1

        const expectedOutcome = {
            id: 1,
            level: 1,
            user: 1,
            book: 1,
            current_progress: 0,
            level_status: 'incomplete'
        }


        Progress.findSpecificEntry.mockResolvedValue(
            {
                id: 1,
                level: 1,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            }
        )

        Progress.changeBookinEntry.mockResolvedValue(expectedOutcome)

        const result = await ProgressService.changeBookinEntry(level, user, input)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(Progress.findSpecificEntry).toBeCalledWith(1, 1)

        expect(Progress.changeBookinEntry).toHaveBeenCalledTimes(1)
        expect(Progress.changeBookinEntry).toHaveBeenCalledWith(1, 1, 1)
    })

    test('Get all entries', async () => {
        const mockEntries = [
            {
                level: 1,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
        ]

        Progress.getAll.mockResolvedValue(mockEntries)

        const result = await ProgressService.getAllProgress()

        expect(result).toStrictEqual(mockEntries)

        expect(Progress.getAll).toHaveBeenCalledTimes(1)
    })
})