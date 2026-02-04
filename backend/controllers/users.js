// Used for user related routing
const usersRouter = require('express').Router()
const UserService = require('../services/userService')

// example route for getting all users
usersRouter.get('/users', async (request, response) => {
    const users = await UserService.getAllUsers()
    response.json(users)
})

// add more routes here



export default usersRouter