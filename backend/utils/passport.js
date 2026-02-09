import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import UserService from '../services/userService.js'
import logger from './logger.js'
// !! vv !!
// After Google login, passport stores the user in request.user
// !! ^^ !!
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
    },

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

passport.deserializeUser((user, done) => {
    try {
        if (!user.id) {
            logger.error('user.id in passport deserialization is undefined')
        }
        const user = UserService.findById(user.id)
        done(null, user)
    } catch (error) {
        done(error, user)
    }
    done(null, user)
})

// not sure if this export is needed,
// if not, change this in app.js from this: import passport from './utils/passport.js'
// to this: import passport from 'passport'
export default passport