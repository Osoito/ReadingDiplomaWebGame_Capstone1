import express from 'express'
import passport from 'passport'
import logger from '../utils/logger.js'
import { rateLimit } from 'express-rate-limit'
import middleware from '../utils/middleware.js'

const authRouter = express.Router()

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                    // limit each IP
    message: 'Too many login attempts, please try again later.'
})


// Returns the current user session for the frontend auth check
authRouter.get('/me', (request, response) => {
    if (request.isAuthenticated()) {
        return response.json({
            id: request.user.id,
            email: request.user.email,
            name: request.user.name,
            role: request.user.role,
            avatar: request.user.avatar,
            grade: request.user.grade
        })
    }
    return response.status(401).json({ error: 'Not authenticated' })
})

// Basic authentication without google
authRouter.post('/login', loginLimiter, middleware.requireAuthentication(false), async (request, response, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) return next(error)

        if (!user) {
            return response.status(401).json({ error: info?.message || 'Invalid credentials' })
        }

        // Creates the session
        request.logIn(user, (error) => {
            if (error) return next(error)

            return response.status(200).json({
                id: user.id,
                email: user.email,
                username: user.name,
                role: user.role
            })
        })
    })(request, response, next)
})

// vvv Changed this to post, since no data is being fetched here, it can be changed back if this is too bothersome
authRouter.post('/logout', middleware.requireAuthentication(true), (request, response, next) => {
    response.clearCookie('connect.sid')
    request.logout((error) => {
        if (error) return next(error)
        request.session.destroy()
        return response.status(204).end()
    })
})

// Start Google authentication
authRouter.get('/google', middleware.requireAuthentication(false), passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}))

// Google callback
authRouter.get('/google/callback', middleware.requireAuthentication(false), passport.authenticate('google', {
    failureRedirect: '/',
    session: true // login state saved in session
}), (request, response, next) => {
    // Successful authentication
    //request.session.save(() => { // for modifying the session manually
    try {
        if (request.user?.needsOnboarding) {
            logger.info('User needs onboarding...')
        }
        return response.redirect(302, process.env.FRONTEND_URL || 'http://localhost:5173/') // Redirect to frontend dashboard
    } catch (error) {
        next(error)
    }
})

export default authRouter
