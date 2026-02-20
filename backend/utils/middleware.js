import logger from './logger.js'
import { z } from 'zod'
//import jwt from 'jsonwebtoken'
// middleware used for logging requests
// can also be used for logging errors, handling unknown endpoints, etc.
// Might be good for user authentication as well

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

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
/*
const authMiddleware = (request, response, next) => {
    const auth = request.get('authorization')

    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
        return response.status(401).json({ error: 'token missing' })
    }

    const token = auth.substring(7)

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        request.user = decoded
        next()
    } catch {
        response.status(401).json({ error: 'token invalid' })
    }
}
*/

function requireTeacherRole(request, response, next) {
    if (request.isAuthenticated() && request.user.role === 'teacher') {
        return next()
    }
    return response.status(403).json({ error: 'Forbidden' })
}

function requireAuthentication(required) {
    return function(request, response, next){
        if (request.isAuthenticated() && required) {
            return next()
        }else if(!request.isAuthenticated() && !required){
            return next()
        }
        return response.status(403).json({ error: 'Forbidden' })
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
    } else if(error.name === 'RoleChangeFail'){
        return response.status(500).send({ error: 'Role change failed' })
    } else if(error.name === 'PasswordChangeFail'){
        return response.status(500).send({ error:'Password change failed' })
    } else if(error.name === 'LevelAlreadyComplete'){
        return response.status(500).send({ error:'Level is already completed' })
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

// Might be dangerous, since if this function has problems it will cause problems for the whole application
function authAndOnboardingGate(request, response, next) {
    // Paths allowed if not logged in
    const publicPaths = [
        '/login',
        '/auth/login',
        '/auth/google',
        '/auth/google/callback',
        '/auth/update-profile'
    ]
    // Paths not allowed if logged in
    const loginPaths = [
        '/login',
        '/auth',
        '/auth/login',
        '/auth/google'
    ]

    // If logged in, deny access to login pages
    if (request?.user && loginPaths.some(path => request.path.startsWith(path))) {
        /*const err = new Error('Access denied')
        err.name = 'AuthError'
        err.status = 401
        err.message = 'User is already logged in'
        throw err*/
        return response.redirect('/')
    }

    // Allow public routes
    if (publicPaths.some(path => request.path.startsWith(path))) {
        return next()
    }

    // Require login
    if (!request.user) {
        logger.error('User needs to login')
        return response.redirect('/login')
    }

    // Require onboarding
    if (request.user && request.user.needsOnboarding) {
        if (!request.user.id) {
            // Handle missing id gracefully
            logger.error('request.user.id is undefined')
            return response.status(500).send({ error: 'User session invalid. Please login again.' })
        }
        return response.redirect(`/auth/update-profile/${request.user.id}`)
    }

    // Otherwise allow access
    next()
}

export default {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    zValidate,
    requireTeacherRole,
    requireAuthentication,
    authAndOnboardingGate
}