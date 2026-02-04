require('dotenv').config()
import logger from './utils/logger'
// import config from './utils/config'
import middleware from './utils/middleware'
import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import usersRouter from './controllers/users'

const app = express()

logger.info('Connecting')

// connect to db here



app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

// define routes here
app.use('/api/users', usersRouter)

export default { app }