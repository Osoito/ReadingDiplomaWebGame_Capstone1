import 'dotenv/config'
import logger from './logger.js'
// Makes sure all the required env variables are present in the env file

// The following env variables are required!!!
let PORT

try {
    PORT = process.env.PORT
    const DB_PASSWORD = process.env.DB_PASSWORD
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    const SESSION_SECRET = process.env.SESSION_SECRET

    const envVariables = {
        PORT: PORT,
        DB_PASSWORD: DB_PASSWORD,
        GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET,
        SESSION_SECRET: SESSION_SECRET
    }

    if (process.env.NODE_ENV === 'production') {
        envVariables.PUBLIC_URL = process.env.PUBLIC_URL
    }

    const entries = Object.entries(envVariables)

    if (Object.values(envVariables).includes(undefined)) {
        //logger.info(`Env variables expected: ${Object.keys(envVariables)}\n`)
        //logger.info(`Env variables found: ${entries.map(e => !e[1] ? '-undefined-' : e[0])}\n`)
        logger.error(`Missing env variables required in ${process.env.NODE_ENV} environment`)
        throw new Error(`>>> Missing env variables:${entries.reduce((res, e) => {
            if (!e[1]) {
                res.push(` ${e[0]}`)
            }
            return res
        }, [])
        }\n`)
    }
} catch (err) {
    logger.info(err)
    logger.info(`To solve this, create a file with the name .env to backend/ and add the required variables to it, variables can be found in GitHub at https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1?tab=readme-ov-file#backend`)
    process.exit(1)
}

export default { PORT }