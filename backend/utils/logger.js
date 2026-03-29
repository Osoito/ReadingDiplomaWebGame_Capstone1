import 'dotenv/config'
// logger for printing messages to console

const info = (...params) => {
    console.log(...params)
}

const error = (...params) => {
    // Removes console errors when testing.
    if (process.env.NODE_ENV !== 'test') {
        console.error('Error:', ...params)
    }
}

export default {
    info, error
}