/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
import bcrypt from 'bcrypt'
// CURRENTLY not in use!
export async function seed(knex) {
    // Deletes ALL existing entries
    return await knex('users').del()
        // Inserts entries one by one
        .then(async () => {
            const newUser = {
                email: 'john@doe.com',
                name: 'John',
                password_hash:'Password-1',
                avatar: 'avatars/avatar1.jpg',
                grade: 1
            }
            const password_hash = await bcrypt.hash(newUser.password_hash, 12)
            newUser.password_hash = password_hash
            return await knex('users').insert(newUser)
            /* -- For inserting entries all at once --
            return await knex('users').insert([
                { id: 1, email: 'john@doe.com', name: 'John', password: 'Password-1', avatar: 'avatars/avatar1.jpg', grade: 1 },
                { id: 2, name: 'Alice', password: 'password1123', avatar: 'avatars/avatar2.jpg', grade: 2 },
            ])*/
        }).then(async () => {
            const newUser = {
                name: 'Alice',
                password_hash:'password112',
                avatar: 'avatars/avatar2.jpg',
                grade: 2
            }
            const password_hash = await bcrypt.hash(newUser.password_hash, 12)
            newUser.password_hash = password_hash
            return await knex('users').insert(newUser)
        }).then(async () => {
            const newUser = {
                name: 'Kalle',
                password_hash:'password',
                avatar: 'avatars/avatar3.jpg'
            }
            const password_hash = await bcrypt.hash(newUser.password_hash, 12)
            newUser.password_hash = password_hash
            return await knex('users').insert(newUser)
        })
}
