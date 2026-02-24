import bcrypt from 'bcrypt'

// This file is used to simulate database
// mockedUsers are fetched from here for some user tests

const passwordHash = await bcrypt.hash('sekret', 10)
const mockedUsers = {
    mockTeacherLogin: {
        id: 1,
        email: 'root@root.com',
        name: 'root',
        password_hash: passwordHash,
        avatar: 'avatars/avatar1.jpg',
        currently_reading: null,
        grade: 1,
        role: 'teacher',
        teacher_id: null
    },
    mockStudentLogin: {
        id: 2,
        email: 'user@basic.com',
        name: 'User',
        password_hash: passwordHash,
        avatar: 'avatars/avatar2.jpg',
        currently_reading: null,
        grade: 2,
        role: 'student',
        teacher_id: 1
    },
    teacher: {
        id: 3,
        email: 'homer@simpson.com',
        name: 'Homer',
        password_hash: 'mocked_hash',
        avatar: 'avatars/homer.jpg',
        currently_reading: null,
        grade: 1,
        role: 'teacher',
        teacher_id: null
    },
    student: {
        id: 4,
        email: 'bart@simpson.com',
        name: 'Bartholomev',
        password_hash: 'mocked_hash',
        avatar: 'avatars/bart.jpg',
        currently_reading: null,
        grade: 1,
        role: 'student',
        teacher_id: 1
    }
}

const initialUsers = [
    {
        id: 1,
        email: 'root@root.com',
        name: 'root',
        password_hash: passwordHash,
        avatar: 'avatars/avatar1.jpg',
        currently_reading: null,
        grade: 1,
        role: 'teacher',
        teacher_id: null
    },
    {
        id: 2,
        email: 'john@doe.com',
        name: 'John',
        password_hash: 'mocked_hash',
        avatar: 'avatars/avatar1.jpg',
        currently_reading: null,
        grade: 1,
        role: 'student',
        teacher_id: 1
    },
    {
        id: 3,
        email: 'timo@edu.com',
        name: 'Timo',
        password_hash: 'mocked_hash',
        avatar: 'avatars/avatar1.jpg',
        currently_reading: null,
        grade: 6,
        role: 'teacher',
        teacher_id: null
    },
    {
        id: 4,
        email: 'homer@simpson.com',
        name: 'Homer',
        password_hash: 'mocked_hash',
        avatar: 'avatars/homer.jpg',
        currently_reading: null,
        grade: 1,
        role: 'teacher',
        teacher_id: null
    },
    {
        id: 5,
        email: 'bart@simpson.com',
        name: 'Bartholomev',
        password_hash: 'mocked_hash',
        avatar: 'avatars/bart.jpg',
        currently_reading: null,
        grade: 1,
        role: 'student',
        teacher_id: 1
    }
]

export default { initialUsers, mockedUsers }