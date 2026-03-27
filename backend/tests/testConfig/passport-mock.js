import passport from 'passport'
import TestStrategy from './test-strategy.js'

// For importing the userService dynamically when a user is logged in
let userResolver = async (id) => {
    const { default: userService } = await import('../../services/userService.js')
    return userService.findById(id)
}

export function useMockUser(user) {
    // Simulates a local strategy using a test strategy
    passport.use('local', new TestStrategy(user))
}

export function useMockFailure(info = { message: 'Invalid credentials' }) {
    // Simulates a failed login attempt, since passwords aren't compared here
    passport.use('local', new TestStrategy(false, info ))
}

export function clearMockPassport() {
    // Clears session data
    if (typeof passport.unuse === 'function') {
        passport.unuse('local')
    } else {
        delete passport.strategies?.local
    }
}

passport.serializeUser((user, done) => {
    // Used in login
    try {
        const id = user && (user.id ?? user._id)
        if (!id) {
            return done(new Error('No user id to serialize'))
        }
        done(null, id)
    } catch (err) {
        done(err)
    }
})

passport.deserializeUser(async (id, done) => {
    // Used with every request, when logged in
    try {
        const user = await userResolver(id)
        if (!user) {
            return done(new Error('User not found'))
        }
        done(null, user)
    } catch (error) {
        done(error)
    }
})

passport.use('test-user', new TestStrategy(null))

passport.initialize = function () {
    return (request, response, next) => {
        // Replaces real initialization with a fake one that allows the request header to be set, good for testing
        if (process.env.NODE_ENV === 'test' && request.headers['x-test-user']) {
            request.user = JSON.parse(request.headers['x-test-user'])
            return next()
        }

        // Otherwise use normal initialization
        return next()
    }
}

export default passport