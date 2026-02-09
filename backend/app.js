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
// import passport from 'passport'
import passport from './utils/passport.js'

const app = express()

logger.info('Connecting')

// connect to db here



app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger) // prints all requests in the console

// -- NOT yet implemented!! v
// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret',
    resave: false,
    saveUninitialized: false,
}))
// -- NOT yet implemented!! ^

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// define routes here
app.use('/api/users', usersRouter)
app.use('/api/books', booksRouter)
app.use('/auth', authRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app