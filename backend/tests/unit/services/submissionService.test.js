import { vi, test, expect, describe } from 'vitest'
import Submission from '../../../models/submission.js'
import SubmissionService from '../../../services/submissionService.js'


// Mock the required functions from rewards model
vi.mock('../../../models/submission.js', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        default: {
            ...actual,
            getSpecific: vi.fn(),
            create: vi.fn(),
            getAllBasedOnUser: vi.fn(),
            getById: vi.fn(),
            remove: vi.fn(),
            getSubmissionsForTeacher: vi.fn(),
            getSubmissionsForTeacherByStudent: vi.fn()
        }
    }
})

describe('SubmissionService unit tests', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Add a submission', async() => {
        const input = {
            user: 1,
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            completedLevel: 1,
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        const expectedOutcome = {
            id: 1,
            user: 1,
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            completedLevel: 1,
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        Submission.create.mockResolvedValue(expectedOutcome)

        Submission.getSpecific.mockResolvedValue(null)

        const result = await SubmissionService.createSubmission(input)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Submission.getSpecific).toHaveBeenCalledTimes(1)
        expect(Submission.create).toHaveBeenCalledTimes(1)
        expect(Submission.getSpecific).toHaveBeenCalledWith(input.user, input.completedLevel)
        expect(Submission.create).toHaveBeenCalledWith(input)
    })

    test('Add a duplicate submission', async() => {
        const input = {
            user: 1,
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            completedLevel: 1,
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }


        Submission.getSpecific.mockResolvedValue(input)

        await expect(SubmissionService.createSubmission(input))
            .rejects
            .toThrow('User has already submitted this question on this level')

        expect(Submission.getSpecific).toHaveBeenCalledTimes(1)
        expect(Submission.create).not.toHaveBeenCalledTimes(1)
        expect(Submission.getSpecific).toHaveBeenCalledWith(input.user, input.completedLevel)

    })

    test('Get submissions for a specific user', async () => {
        const expectedOutcome = [
            {
                id: 1,
                user: 1,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: 1,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            },
            {
                id: 2,
                user: 1,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: 2,
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            }
        ]

        Submission.getAllBasedOnUser.mockResolvedValue(expectedOutcome)

        const result = await SubmissionService.getSpecificUser(1)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Submission.getAllBasedOnUser).toHaveBeenCalledTimes(1)
        expect(Submission.getAllBasedOnUser).toHaveBeenCalledWith(1)
    })

    test('Fail to get submissions for a specific user', async() => {
        Submission.getAllBasedOnUser.mockResolvedValue(null)

        await expect(SubmissionService.getSpecificUser(1))
            .rejects
            .toThrow('User has no submissions')

        expect(Submission.getAllBasedOnUser).toHaveBeenCalledTimes(1)
        expect(Submission.getAllBasedOnUser).toHaveBeenCalledWith(1)
    })

    test('Get submission by id', async() => {
        const id = 2
        const teacher_id = 1

        const expectedOutcome = {
            id: 1,
            user: 1,
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            completedLevel: 1,
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        Submission.getById.mockResolvedValue(expectedOutcome)

        const result = await SubmissionService.getById(id, teacher_id)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Submission.getById).toHaveBeenCalledTimes(1)
        expect(Submission.getById).toHaveBeenCalledWith(id, teacher_id)
    })

    test('Fail to get submission by id', async() => {
        const id = 2
        const teacher_id = 1

        Submission.getById.mockResolvedValue(null)

        await expect(SubmissionService.getById(id, teacher_id))
            .rejects
            .toThrow('Submission not found')

        expect(Submission.getById).toHaveBeenCalledTimes(1)
        expect(Submission.getById).toHaveBeenCalledWith(id, teacher_id)
    })

    test('Delete a submission', async() => {
        const id = 2
        const teacher_id = 1

        const mockSubmission = {
            id: 1,
            user: 1,
            question1: 'Test question 1',
            answer1: 'Test answer 1',
            completedLevel: 1,
            question2: 'Test question 2',
            answer2: 'Test answer 2',
            question3: 'Test question 3',
            answer3: 'Test answer 3'
        }

        Submission.getById.mockResolvedValue(mockSubmission)

        await SubmissionService.deleteSubmission(id, teacher_id)

        expect(Submission.getById).toHaveBeenCalledTimes(1)
        expect(Submission.getById).toHaveBeenCalledWith(id, teacher_id)
        expect(Submission.remove).toHaveBeenCalledTimes(1)
        expect(Submission.remove).toHaveBeenCalledWith(id)
    })

    test('Fail to delete a submission', async () => {
        const id = 2
        const teacher_id = 1

        Submission.getById.mockResolvedValue(null)

        await expect(SubmissionService.deleteSubmission(id, teacher_id))
            .rejects
            .toThrow('Submission not found')

        expect(Submission.getById).toHaveBeenCalledTimes(1)
        expect(Submission.getById).toHaveBeenCalledWith(id, teacher_id)
        expect(Submission.remove).not.toHaveBeenCalledTimes(1)
    })

    test('Get submissions for teacher', async() => {
        const id = 1

        const expectedOutcome = [
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: 1,
                name: 'testUser',
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            },
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: 2,
                name: 'testUser',
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            }
        ]

        Submission.getSubmissionsForTeacher.mockResolvedValue(expectedOutcome)

        const result = await SubmissionService.getSubmissionsForTeacher(id)

        expect(result).toStrictEqual(expectedOutcome)

        expect(Submission.getSubmissionsForTeacher).toHaveBeenCalledTimes(1)
        expect(Submission.getSubmissionsForTeacher).toHaveBeenCalledWith(id)
    })

    test('Fail to get submissions for teacher', async() => {
        const id = 1

        Submission.getSubmissionsForTeacher.mockResolvedValue(null)

        await expect(SubmissionService.getSubmissionsForTeacher(id))
            .rejects
            .toThrow('No submissions for this teacher')

        expect(Submission.getSubmissionsForTeacher).toHaveBeenCalledTimes(1)
        expect(Submission.getSubmissionsForTeacher).toHaveBeenCalledWith(id)
    })

    test('Get all entries for a specific student who belongs to current teacher', async() => {
        const id = 2
        const teacher_id = 1
        const expectedOutcome = [
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: 1,
                name: 'testUser',
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            },
            {
                user: 2,
                question1: 'Test question 1',
                answer1: 'Test answer 1',
                completedLevel: 2,
                name: 'testUser',
                question2: 'Test question 2',
                answer2: 'Test answer 2',
                question3: 'Test question 3',
                answer3: 'Test answer 3'
            }
        ]

        Submission.getSubmissionsForTeacherByStudent.mockResolvedValue(expectedOutcome)

        const result = await SubmissionService.findByUserAndTeacher({ userId: id, teacherId: teacher_id })

        expect(result).toStrictEqual(expectedOutcome)

        expect(Submission.getSubmissionsForTeacherByStudent).toHaveBeenCalledTimes(1)
        expect(Submission.getSubmissionsForTeacherByStudent).toHaveBeenCalledWith(id, teacher_id)
    })

    test('Fail to get all entries for a specific student who belongs to current teacher', async() => {
        const id = 2
        const teacher_id = 1

        Submission.getSubmissionsForTeacherByStudent.mockResolvedValue(undefined)

        await expect(SubmissionService.findByUserAndTeacher({ userId: id, teacherId: teacher_id }))
            .rejects
            .toThrow(`No submission entries found for this student or student isn't under this teacher`)

        expect(Submission.getSubmissionsForTeacherByStudent).toHaveBeenCalledTimes(1)
        expect(Submission.getSubmissionsForTeacherByStudent).toHaveBeenCalledWith(id, teacher_id)
    })
})