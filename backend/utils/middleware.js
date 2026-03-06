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
    if (!request.isAuthenticated() || !request.user) {
        const err = new Error('Unauthorized')
        err.status = 401
        throw err
    } else if (request.user.role !== 'teacher') {
        const err = new Error('Forbidden')
        err.status = 403
        throw err
    } else {
        return next()
    }
}

function requireAuthentication(required) {
    return (request, response, next) => {
        if (!request.isAuthenticated() && required) {
            const err = new Error('Unauthorized')
            err.status = 401
            throw err
        } else if (request.isAuthenticated() && !required) {
            const err = new Error('Unauthorized')
            err.status = 401
            throw err
        } else {
            return next()
        }
    }
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// middleware for error handling
const errorHandler = (error, request, response, next) => {
    /*
    > In errors with name (that exist in the list below) < (Used for more common errors)
    const err = new Error('Unauthorized access') <-- This message is printed to console for developers to see
    err.name = 'Forbidden'                       <-- the error message and status the client receives is defined below
    throw err

    > In errors with status and no name or details < (Used for more specific errors)
    const err = new Error('Username already taken') <-- Shown to the user and printed in the console
    err.status = 400                                <-- Status the client receives
    throw err

    > In errors with userDetails < (Used for custom errors)
    const err = new Error('Caused by missing name') <-- Printed to console for developers to see
    err.userDetails = 'Username already taken'      <-- Sent to the client/user
    err.status = 400                                <-- The status the client receives
    throw err

    > Unhandled errors <
    return error status 500 and error message 'Internal server error' to client
    and prints the actual error to backend console/terminal for developers to see
    */

    logger.error(error.message)
    if (error.name === 'ValidationError') {
        // for errors thrown by the zValidate middleware
        return response.status(400).json({
            error: error.message,
            details: error.details // details using the zod library
        })
    } else if (error.name === 'userNotFound') {
        return response.status(404).send({ error: 'User not found' })
    } else if (error.userDetails) {
        // For custom errors with a specified message to both users and developers
        return response.status(error.status).json({
            error: error.userDetails
        })
    } else if (!error.status || error.status === 500) {
        // For unhandled errors
        // Doesn't reveal specific internal server errors to client (e.g. Cannot read properties of undefined (reading 'role'))
        // The client gets 'Internal server error' and the actual error is printed to the backend console by logger.error
        return response.status(500).json({ error: 'Internal server error' })
    } else {
        // non async errors are be handed to the default Express error handler
        next()

        // for more specific errors
        return response.status(error.status).json({
            error: error.message
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