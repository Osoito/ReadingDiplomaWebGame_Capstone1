import 'dotenv/config'
// can be used to get environment variables from a .env file in backend root

// example of .env file content:
// PORT=5432

let PORT = process.env.PORT

export default { PORT }