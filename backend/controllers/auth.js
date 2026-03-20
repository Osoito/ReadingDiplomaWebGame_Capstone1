import express from 'express'
import passport from 'passport'
import logger from '../utils/logger.js'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import middleware from '../utils/middleware.js'

const authRouter = express.Router()

// Helper for creating limiters for the /login and /me routes that differ from the general limiters defined in app.js
const makeLimiter = ({ windowMs, max, handler }) => {
    const baseLimiterOptions = {
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler
    }
    if (process.env.NODE_ENV === 'production' && process.env.PUBLIC_URL === 'https://lukudiplomi.onrender.com/') {
        return rateLimit({
            ...baseLimiterOptions,
            keyGenerator: (req) => {
                const realIP = req.headers['true-client-ip'] || req.headers['true-client-ip'.toLowerCase()]
                return realIP || ipKeyGenerator(req.ip)
            },
        })
    } else {
        return rateLimit(baseLimiterOptions)
    }
}

const meLimiter = makeLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 40, // 40 requests per minute
    handler: (req, res) => {
        const retryAfter = req.rateLimit?.resetTime
            ? Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000)
            : Math.ceil(60 * 1000 / 1000)

        return res.status(429).json({
            error: `Liian monta pyyntöä. Yritä uudelleen ${retryAfter} sekunnin kuluttua.`
        })
    }
})

const loginLimiter = makeLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes,
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
})

// Returns the current user session for the frontend auth check
authRouter.get('/me', meLimiter, (request, response) => {
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

// Sets the X-CSRF-TOKEN cookie for the client
// Currently required before basic login, since logout clears cookies and no requests are made between logout and login
authRouter.get('/csrf-token', async (req, res) => {
    if (typeof req.csrfToken === 'function') {
        const token = req.csrfToken()
        return res.json({ csrf: token })
    }
    res.status(204).end()
})

// Basic authentication without google
authRouter.post('/login', loginLimiter, middleware.requireAuthentication(false), async (request, response, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err)
        if (!user) return response.status(401).json({ error: info?.message || 'Väärä nimi tai salasana' })

        // Creates the session
        request.logIn(user, (err) => {
            if (err) return next(err)

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
    request.logout((err) => {
        if (err) return next(err)
        request.session.destroy((err) => {
            if (err) return next(err)
            response.clearCookie('connect.sid')
            response.clearCookie('X-CSRF-TOKEN')
            return response.status(204).end()
        })
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
