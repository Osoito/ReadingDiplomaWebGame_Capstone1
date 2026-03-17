import express from 'express'
import passport from 'passport'
import logger from '../utils/logger.js'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import middleware from '../utils/middleware.js'

const authRouter = express.Router()

const loginTimeout = 2 * 60 * 1000 // 2 minutes
const baseLimiterOptions = {
    windowMs: loginTimeout,
    max: 5,
    handler: (req, res) => {
        // Gives the remaining time for retrying login in response.error
        const resetTime = req.rateLimit && req.rateLimit.resetTime
        let secondsLeft = 0
        if (resetTime) {
            secondsLeft = Math.ceil((resetTime.getTime() - Date.now()) / 1000)
        }

        return res.status(429).json({ error: `Liian monta kirjautumisyritystä. Yritä uudelleen ${Math.ceil(secondsLeft / 60)} minuutin kuluttua.` })
    }
}
const loginLimiter = process.env.NODE_ENV === 'production' && process.env.PUBLIC_URL === 'https://lukudiplomi.onrender.com/'
    ? rateLimit({
        ...baseLimiterOptions,
        keyGenerator: (req) => {
            const realIP = req.headers['true-client-ip'] || req.headers['true-client-ip'.toLowerCase()]
            return realIP || ipKeyGenerator(req.ip)
        },
    })
    : rateLimit(baseLimiterOptions)

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
            return response.status(401).json({ error: info?.message || 'Väärä nimi tai salasana' })
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
        if (process.env.NODE_ENV === 'production') {
            return response.redirect(302, '/')
        } else if (process.env.NODE_ENV === 'development') {
            return response.redirect(302, 'http://localhost:5173/') // Redirect to frontend
        }
    } catch (error) {
        next(error)
    }
})

export default authRouter
