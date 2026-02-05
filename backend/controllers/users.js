import express from 'express'

// Used for user related routing
//const usersRouter = require('express').Router()
const usersRouter = express.Router()
//const UserService = require('../services/userService')
import UserService from '../services/userService.js'
// example route for getting all users
usersRouter.get('/', async (request, response) => {
    const users = await UserService.getAllUsers()
    response.json(users)
})

// add more routes here



export default usersRouter