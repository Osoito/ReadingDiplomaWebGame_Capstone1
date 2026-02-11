import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local'
import UserService from '../services/userService.js'
import bcrypt from 'bcrypt'

// !! vv !!
// After Google login, passport gets the user profile unsing findById
// On every request the deserializeUser function loads the full user from the database into request.user <---
// ^^ ^^^^^ ^^^^^^^                                                                         ^^^^^^^^^^^^
// The following statement can be used to forbid access to resources if not logged in using passport
/*if (!request.isAuthenticated()) {
    const err = new Error('Access denied')
    err.name = 'AuthError'
    err.message = error.message <-- can be used to define the message shown to the user
    err.status = 401
    throw err
}*/
// !! ^^ !!

passport.use(new LocalStrategy(
    // What the frontend needs to send in order for this to work
    /*
        <input name="identifier" placeholder="Email or username">
        <input name="password" type="password">
    */
    { usernameField: 'identifier' },
    async (identifier, password, done) => {
        try {
            let user

            //Check if identifier looks like an email
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)

            if (isEmail) {
                user = await UserService.findByEmail(identifier)
            } else {
                user = await UserService.findByName(identifier)
            }

            if (!user) return done(null, false, { message: 'Invalid credentials' })

            const valid = await bcrypt.compare(password, user.password_hash)
            if (!valid) return done(null, false, { message: 'Invalid credentials' })

            return done(null, user) // user still contains password_hash here
        } catch (error) {
            return done(error)
        }
    }
))

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
    },
    // The accessToken below would be used to make API calls to Google services on behalf of the user
    // Services like Google calendar, Gmail, Google Drive
    // The refreshToken would be used to refresh the accessToken that expires in 1 hour
    async function (accessToken, refreshToken, profile, done) {
        try {
            const user = await UserService.findOrCreateFederatedCredentials(profile)
            // user.needsOnboarding can be used to redirect the user
            // to a sign in page where they will fill out their name, avatar and grade

            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserService.findById(id)
        if (!user.id) {
            return done(new Error('User not found'), null)
        }
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})

export default passport