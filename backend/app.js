import 'dotenv/config'
import logger from './utils/logger.js'
import middleware from './utils/middleware.js'
import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import usersRouter from './controllers/users.js'
import booksRouter from './controllers/books.js'
import authRouter from './controllers/auth.js'
import progressRouter from './controllers/progressController.js'
import rewardsRouter from './controllers/rewards.js'
import session from 'express-session'
import passport from './utils/passport.js'

const app = express()

logger.info('Connecting')

// Allows JavaScript from only this specific origin to read responses
const CORS_OPTIONS = {
    origin: ['http://localhost:5173']
}

app.use(cors(CORS_OPTIONS))
app.use(express.json())

// Express session middleware
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

app.use('/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/books', booksRouter)
app.use('/api/progress', progressRouter)
app.use('/api/rewards', rewardsRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app