import express from 'express'
import passport from 'passport'
import logger from '../utils/logger.js'

const authRouter = express.Router()

// How to use Google authentication in frontend
// <a href="/auth/google">Continue with Google</a>

authRouter.get('/login', async (request, response) => {
    /*const { email, passwordHash } = request.body
    // get user
    response.render('login')
    if (!user.passwordHash) {
        return response.status(400).json({
            error: 'This account uses Google login. Please sign in with Google.'
        })
    }*/
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
}), (request, response) => {
    // Successful authentication
    logger.info(request.user)
    request.session.save(() => { // for modifying the session manually
        if (request.user?.needsOnboarding) {
            logger.info('User needs onboarding. Redirecting to onboarding page...')
            response.redirect('/auth/update-profile')
        } else {
            response.redirect('/') // Redirect to your frontend or dashboard
        }
    })
})

authRouter.get('/update-profile', async (request, response) => {
    /*const { email, passwordHash } = request.body
    // get user
    response.render('login')
    if (!user.passwordHash) {
        return response.status(400).json({
            error: 'This account uses Google login. Please sign in with Google.'
        })
    }*/
})

authRouter.post('/update-profile', async (request, response) => {
    /*const { email, passwordHash } = request.body
    // get user
    response.render('login')
    if (!user.passwordHash) {
        return response.status(400).json({
            error: 'This account uses Google login. Please sign in with Google.'
        })
    }*/
})

export default authRouter
