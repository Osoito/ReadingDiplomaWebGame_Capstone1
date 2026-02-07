// logger for printing messages to console

const info = (...params) => {
    console.log(...params)
}

const error = (...params) => {
    console.error('Error:', ...params)
}

export default {
    info, error
}