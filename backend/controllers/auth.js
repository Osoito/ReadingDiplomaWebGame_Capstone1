import express from 'express'
import passport from 'passport'
import logger from '../utils/logger.js'
import UserService from '../services/userService.js'
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
import { z } from 'zod'
import middleware from '../utils/middleware.js'

const authRouter = express.Router()

const userUpdateSchema = z.object({
    name: z.string(),
    avatar: z.string(),
    grade: z.number(),
}).strict()

// Basic authentication without google
authRouter.post('/login', async (request, response, next) => {
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
    /*const { email, password } = request.body

    let user = await UserService.findByEmail(email)
    if (!user) {
        return response.status(401).json({ error: 'invalid username or password' })
    }
    const passWordCorrect = await bcrypt.compare(password, user.password_hash)
    if (!passWordCorrect) {
        return response.status(401).json({ error: 'invalid username or password' })
    }

    const userForToken = {
        id: user.id,
        email: user.email,
        username: user.name,
        role: user.role
    }

    const token = jwt.sign(userForToken, process.env.JWT_SECRET)

    response.status(200).send({ token, id: user.id, email: user.email, username: user.name, role: user.role })*/
})

authRouter.get('/logout', (request, response) => {
    request.logout(() => {
        response.redirect('/login')
    })
})

// Start Google authentication
authRouter.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

// Google callback
authRouter.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login',
    session: true // login state saved in session
}), (request, response, next) => {
    // Successful authentication
    //request.session.save(() => { // for modifying the session manually
    try {
        if (request.user?.needsOnboarding) {
            logger.info('User needs onboarding. Redirecting to onboarding page...')
            return response.redirect(`/auth/update-profile/${request.user.id}`)
        }
        response.redirect('/') // Redirect to your frontend or dashboard
    } catch (error) {
        next(error)
    }
})

authRouter.get('/update-profile/:id', async (request, response, next) => {
    try {
        const user = await UserService.findById(request.params.id)
        response.json(user)
    } catch (error) {
        next(error)
    }
})

authRouter.patch('/update-profile/:id',
    middleware.zValidate(userUpdateSchema),
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
            response.status(204).json(updatedUser)
        } catch (error) {
            next(error)
        }
    }
)

export default authRouter
