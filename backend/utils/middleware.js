import logger from './logger.js'
import { z } from 'zod'

// middleware used for logging requests
const requestLogger = (request, response, next) => {
    // If the user is logged in log requested info in console
    if (request?.user) {
        logger.info('Requested by (request.user): ', request?.user)
        logger.info(' ')
    }
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

function requireTeacherRole(request, response, next) {
    if (request.isAuthenticated() && request.user.role === 'teacher') {
        return next()
    }
    //return response.status(403).json({ error: 'Forbidden' })
    const err = new Error('Unauthorized access')
    err.name = 'Forbidden'
    err.status = 403
    throw err
}

function requireAuthentication(required) {
    return function (request, response, next) {
        if (request.isAuthenticated() && required) {
            return next()
        } else if (!request.isAuthenticated() && !required) {
            return next()
        }
        const err = new Error('Access denied')
        err.name = 'AuthError'
        err.status = 401
        throw err
    }
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// middleware for error handling
// I think these should be used for general errors, more specific errors are handled at the end
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
        // for token authentication, not sure if this is used anywhere
        return response.status(401).send({ error: 'missing or invalid token' })
    } else if (error.name === 'NotFound') {
        return response.status(404).send({ error: 'Resource not found' })
    } else if (error.name === 'AuthError') {
        return response.status(401).send({ error: error.message })
        /* -- Use this to get deny access to a path --
            const err = new Error('Access denied')
            err.name = 'AuthError'
            err.status = 401
            throw err
        */
    } else if (error.name === 'RoleChangeFail') {
        return response.status(500).send({ error: 'Role change failed' })
    } else if (error.name === 'PasswordChangeFail') {
        return response.status(500).send({ error: 'Password change failed' })
    } else if (error.name === 'LevelAlreadyComplete') {
        return response.status(500).send({ error: 'Level is already completed' })
    } else {
        // pass the error to the default Express error handler if it's not handled above
        next()

        // for unhandled errors
        return response.status(error.status || 500).json({
            error: error.message || 'Internal server error'
        })
    }
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
    requireTeacherRole,
    requireAuthentication
}