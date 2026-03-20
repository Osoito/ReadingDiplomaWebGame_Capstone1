import config from './utils/config.js'
import app from './app.js'
import logger from './utils/logger.js'

app.listen(config.PORT, () => {
    if (process.env.NODE_ENV === 'production') {
        logger.info(`Web service is running at ${process.env.PUBLIC_URL}`)
    } else {
        logger.info(`Server running on port ${config.PORT}`)
    }
})
