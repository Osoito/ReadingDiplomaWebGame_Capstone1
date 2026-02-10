# Reading Diploma Web Game (Capstone 1)
Repo for the course Capstone Project 1. The project is a web-based reading diploma for youth. The idea is to gamify reading books for the youth and that way, encourage them to read more. The solution should work on mobile and PC and have a responsive design. The teachers on the course provided a direction for our idea and in this project plan document we will explain how we are going to approach the solution. Primary and middle schools could be potential customers for this project.  

## Installation & Setup 
>Will be updated as the project progresses

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (https://www.postgresql.org/download/)

### Installation
Create a .env file in the root of your backend which contains these parameters
```
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourPostgresPassword
DB_NAME=rdiploma

GOOGLE_CLIENT_ID=123
GOOGLE_CLIENT_SECRET=123

JWT_SECRET=randomly generated value
SESSION_SECRET=randomly generated value
```
The DB_USER=postgres is the default PostgreSQL username and DB_PASSWORD should be the password you set when installing PostgreSQL. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are used for google authentication and i can't upload them to GitHub, but they will be provided to team members.

You can use the command below to generate the SESSION and JWT SECRETS
>node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```bash
# Backend installation
cd backend
npm install
npm run db:create
npm knex migrate:latest
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```
>(**Optional**) To use psql for database functions (CRUD and data viewing) in the VSCode terminal, add your PostgreSQL installation (e.g. C:\Program Files\PostgreSQL\18\bin) to system environment Path variables
