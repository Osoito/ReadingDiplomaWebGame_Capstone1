import logger from './logger.js'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
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

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const authMiddleware = (request, response, next) => {
    const auth = request.get('authorization')

    if(!auth || !auth.toLowerCase().startsWith('bearer ')){
        return response.status(401).json({ error:'token missing' })
    }

    const token = auth.substring(7)

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        request.user = decoded
        next()
    } catch{
        response.status(401).json({ error:'token invalid' })
    }
}


const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({
            error: error.message,
            details: error.details // details using the zod library
        })
    } else if (error.name === 'TokenError') {
        // for token authentication, not implemented yet
        return response.status(401).send({ error: 'missing or invalid token' })
    }

    // pass the error to the default Express error handler if it's not handled above
    next()

    // for unhandled errors
    return response.status(error.status || 500).json({
        error: error.message || 'Internal server error'
    })
}

// For validating user input using the zod library
function zValidate(schema) {
    return (request, respone, next) => {
        const result = schema.safeParse(request.body)

        if (!result.success) {
            // Error formats: treeifyError(), prettifyError() (requires .split('\n')), flattenError()
            const flat = z.flattenError(result.error)

            // Handle regex errors
            for (const [field, messages] of Object.entries(flat.fieldErrors)) {
                flat.fieldErrors[field] = messages.map(msg => {
                    if (msg.includes('must match pattern')) {
                        return 'Must contain at least one uppercase letter, one lowercase letter, and one special character'
                    }
                    return msg
                })
            }

            const err = new Error('Invalid request data. Unknown, missing or malformed fields. Please check your input.')
            err.name = 'ValidationError'
            err.status = 400
            err.details = flat
            throw err
        }

        request.validated = result.data
        next()
    }
}

export default {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    zValidate,
    authMiddleware
}