import 'dotenv/config'
import logger from './utils/logger.js'
import middleware from './utils/middleware.js'
import express from 'express'
import 'express-async-errors'
import cors from 'cors'
// import db from './db/db.js'
import usersRouter from './controllers/users.js'
import booksRouter from './controllers/books.js'
import authRouter from './controllers/auth.js'
import session from 'express-session'
import passport from './utils/passport.js'

const app = express()

logger.info('Connecting')

app.use(cors())
app.use(express.json())

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// prints all requests in the console
app.use(middleware.requestLogger)

// Uncomment this v for production, it's very burdensome during development and testing
// app.use(middleware.authAndOnboardingGate) // requires the user to be logged in to access any page besides login pages

// define routes here
app.use('/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/books', booksRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app