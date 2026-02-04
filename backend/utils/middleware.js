import logger from './logger.js'

// middleware used for logging requests
// can also be used for logging errors, handling unknown endpoints, etc.
// Might be good for user authentication as well

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

export default {
    requestLogger
}