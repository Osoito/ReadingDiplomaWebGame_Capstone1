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
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, _next) => {
    /*
    > In errors with name (that exist in the list below) < (Used for more common errors)
    const err = new Error('Unauthorized access') <-- This message is printed to console for developers to see
    err.name = 'Forbidden'                       <-- the error message and status the client receives can be defined below
    throw err

    > In errors with status and no name or details < (Used for more specific errors)
    const err = new Error('Username already taken') <-- Shown to the user and printed in the console
    err.status = 400                                <-- Status the client receives
    throw err

    > In errors with userDetails < (Used for custom errors, most useful IMO)
    const err = new Error('Caused by missing name') <-- Printed to console for developers to see
    err.userDetails = 'Username already taken'      <-- Sent to the client/user
    err.status = 400                                <-- The status the client receives
    throw err

    > Unhandled errors <
    return error status 500 and error message 'Internal server error' to client
    and prints the actual error to backend console/terminal for developers to see
    */

    logger.error(error.message)
    if (error.name === 'userNotFound') {
        return response.status(404).send({ error: 'Käyttäjää ei löytynyt' })
    } else if (error.userDetails) {
        // For custom errors with a seperate message for users and developers
        return response.status(error.status).json({
            error: error.userDetails
        })
    } else if (error.message.includes('CSRF')) {
        // For errors about CSRF tokens, caused by the lusca library
        return response.status(403).json({ error: 'Invalid CSRF token' })
    } else if (!error.status || error.status === 500) {
        // For unhandled errors
        // Doesn't reveal specific internal server errors to client (e.g. Cannot read properties of undefined (reading 'role'))
        // The client gets 'Internal server error' and the actual error is printed to the backend console by logger.error
        return response.status(500).json({ error: 'Internal server error' })
    } else {
        // for more specific errors (error with status and no name or details)
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

            const fields = Object.entries(flat.fieldErrors)
                .map(([field, messages]) => `${field}: ${messages?.[0] ?? ''}, `)
                .join('\n')

            const err = new Error(JSON.stringify(flat))
            err.status = 400
            err.userDetails = flat.formErrors.length !== 0 ? flat.formErrors[0] : fields
            next(err)
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