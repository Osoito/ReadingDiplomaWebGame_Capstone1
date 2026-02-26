import express from 'express'
import passport from 'passport'
import logger from '../utils/logger.js'
import UserService from '../services/userService.js'
import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'
import middleware from '../utils/middleware.js'

const authRouter = express.Router()

const userUpdateSchema = z.object({
    name: z.string(),
    avatar: z.string(),
    grade: z.number(),
}).strict()

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
        return response.redirect(302, '/')
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
        // Commented this out, until '/update-profile/:id' has a frontend page, **if it needs to be implemented**.
        // Maybe that could be converted to profile updating, if we need that
        if (request.user?.needsOnboarding) {
            logger.info('User needs onboarding. '/*Redirecting to onboarding page...'*/)
            //return response.redirect(`/auth/update-profile/${request.user.id}`)
        }
        // Not sure what would be a good way to redirect to frontend url from here.
        // I don't think it's good to have these redirects hardcoded, might be better to do this in the frontend vvv
        return response.redirect(302, 'http://localhost:5173/teacher/dashboard') // Redirect to teacher dashboard
        // With this '/teacher/dashboard' it would redirect to ...:3001/teacher/dashboard
    } catch (error) {
        next(error)
    }
})

authRouter.get('/update-profile/:id', middleware.requireAuthentication(true), async (request, response, next) => {
    try {
        const user = await UserService.findById(request.params.id)
        response.json(user)
    } catch (error) {
        next(error)
    }
})

authRouter.patch('/update-profile/:id',
    middleware.zValidate(userUpdateSchema),
    middleware.requireAuthentication(true),
    async (request, response, next) => {
        const { name, avatar, grade } = request.validated
        const id = request.params.id

        try {
            const updatedUser = {
                id,
                name,
                avatar,
                grade
            }

            await UserService.completeProfile(updatedUser)
            // Redirect to teacher dashboard after updating profile information
            return response.redirect(302, 'http://localhost:5173/teacher/dashboard')
        } catch (error) {
            next(error)
        }
    }
)

export default authRouter
