import 'dotenv/config'
import logger from './utils/logger.js'
import middleware from './utils/middleware.js'
import express from 'express'
import cors from 'cors'
import usersRouter from './controllers/users.js'
import booksRouter from './controllers/books.js'
import authRouter from './controllers/auth.js'
import progressRouter from './controllers/progressController.js'
import rewardsRouter from './controllers/rewards.js'
import session from 'express-session'
import memorystore from 'memorystore'
import passport from './utils/passport.js'

import path from 'path'
import { fileURLToPath } from 'url'

const app = express()

logger.info('Connecting')

// Allows JavaScript from only this specific origin to read responses
const CORS_OPTIONS = {
    // In production the PUBLIC_URL is the public domain
    origin: [process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : 'http://localhost:5173'],
    credentials: true
}

app.use(cors(CORS_OPTIONS))
app.use(express.json())

const MemoryStore = memorystore(session)

// Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new MemoryStore({
        checkPeriod: 43200000 // prune expired entries every 12h, to avoid memory leaks
    }),
    resave: false,
    saveUninitialized: false
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

if (process.env.NODE_ENV === 'production') {
    // derive __filename and __dirname in ESM
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const distPath = path.resolve(__dirname, '../frontend/dist')

    // ∨∨∨ for debugging production build (dist/) path
    // logger.info(`serving frontend from ${distPath}`)

    app.use(express.static(distPath))

    // SPA fallback for client-side routing
    // Without this, non API routes e.g., /student/dashboard will produce a 404 error
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'))
    })
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
