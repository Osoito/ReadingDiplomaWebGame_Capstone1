//require('dotenv').config()
import 'dotenv/config'
import logger from './utils/logger.js'
// import config from './utils/config'
import middleware from './utils/middleware.js'
import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import db from './db/db.js'
import usersRouter from './controllers/users.js'
import booksRouter from './controllers/books.js'

const app = express()

logger.info('Connecting')

// connect to db here



app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

// define routes here
app.use('/api/users', usersRouter)
app.use('/api/books', booksRouter)

export default app 