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
            getAll: vi.fn(),
            findByUserAndTeacher: vi.fn()
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

    test('Try to add duplicate entry', async () => {
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

        Progress.create.mockResolvedValue(expectedOutcome)
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

        await expect(ProgressService.addNewProgress(input))
            .rejects
            .toThrow(`This user already has a progress entry for level ${input.level}`)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(Progress.create).not.toHaveBeenCalledTimes(1)
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

    test('Try to mark level as complete that does not exist', async () => {
        const input = {
            user: 1
        }
        const level = 1

        Progress.findSpecificEntry.mockResolvedValue(null)

        await expect(ProgressService.completeLevel(level, input))
            .rejects
            .toThrow(`Level ${level} was not found for this user`)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(Progress.completeLevel).not.toHaveBeenCalledTimes(1)
    })


    test('Try to complete an already completed level', async () => {
        const input = {
            user: 1
        }
        const level = 1

        Progress.findSpecificEntry.mockResolvedValue(
            {
                id: 1,
                level: 1,
                user: 1,
                book: null,
                current_progress: 0,
                level_status: 'complete'
            }
        )

        await expect(ProgressService.completeLevel(level, input))
            .rejects
            .toThrow(`Level already completed`)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(Progress.completeLevel).not.toHaveBeenCalledTimes(1)
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

    test('Try to find entries for the user when they are not there', async () => {
        const input = {
            user: 1
        }

        Progress.findByUser.mockResolvedValue(null)

        await expect(ProgressService.findByUser(input))
            .rejects
            .toThrow('No progress entries found for this user')

        expect(Progress.findByUser).toHaveBeenCalledTimes(1)
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

    test('Find non-existent progress entry', async () => {
        const input = {
            level:1,
            user: 1
        }

        Progress.findSpecificEntry.mockResolvedValue(null)

        await expect(ProgressService.findSpecificEntry(input.level, input.user))
            .rejects
            .toThrow(`Level:  ${input.level} has no entry for this user`)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
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
    })

    test('Fail to get current level', async() => {
        const input = {
            user: 1
        }

        Progress.getCurrentLevel.mockResolvedValue(null)

        await expect(ProgressService.getCurrentLevel(input.user))
            .rejects
            .toThrow('Was not able to fetch the current level for this user')
        expect(Progress.getCurrentLevel).toHaveBeenCalledTimes(1)
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

    test('Fail to change book in entry', async() => {
        const input = {
            book: 1
        }
        const level = 1
        const user = 1

        Progress.findSpecificEntry.mockResolvedValue(null)

        await expect(ProgressService.changeBookinEntry(level, user, input))
            .rejects
            .toThrow(`Level:  ${level} has no entry for this user`)

        expect(Progress.findSpecificEntry).toHaveBeenCalledTimes(1)
        expect(Progress.changeBookinEntry).not.toHaveBeenCalledTimes(1)
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

    test('Find all entries for a specific user of the current teacher', async() => {
        const mockEntries = [
            {
                level: 1,
                user: 2,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: 2,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
            {
                level: 2,
                user: 2,
                book: null,
                current_progress: 0,
                level_status: 'incomplete'
            },
        ]

        Progress.findByUserAndTeacher.mockResolvedValue(mockEntries)

        const result = await ProgressService.findByUserAndTeacher({ userId: 2, teacherId: 1 })

        expect(result).toStrictEqual(mockEntries)

        expect(Progress.findByUserAndTeacher).toHaveBeenCalledTimes(1)
    })

    test('Fail to find all entries for a specific user of the current teacher', async() => {
        Progress.findByUserAndTeacher.mockResolvedValue(undefined)

        await expect(ProgressService.findByUserAndTeacher({ userId: 2, teacherId: 1 }))
            .rejects
            .toThrow('No progress entries found for this student, being taught by this teacher')

        expect(Progress.findByUserAndTeacher).toHaveBeenCalledTimes(1)
    })
})