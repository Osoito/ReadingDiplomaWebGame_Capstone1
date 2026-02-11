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
PORT=3001                           #<--- Port where the backend will run

DB_HOST=localhost
DB_PORT=5432                        #<--- Port where your PostgreSQL database is running
DB_USER=postgres                    #<--- PostgreSQL username (postgres by default)
DB_PASSWORD=yourPostgresPassword    #<--- Password set when installing PostgreSQL (password for DB_USER)
DB_NAME=rdiploma                    #<--- Name of the database (rdiploma, if created using the script)

GOOGLE_CLIENT_ID=123
GOOGLE_CLIENT_SECRET=123

#JWT_SECRET=randomly generated value <--- Currently not in use
SESSION_SECRET=randomly generated value
```
GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are used for google authentication and i can't upload them to GitHub, but they will be provided to team members.

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
# Backend runs on http://localhost:3001
```
>(**Optional**) To use psql for database functions (CRUD and data viewing) in the VSCode terminal, add your PostgreSQL installation (e.g. C:\Program Files\PostgreSQL\18\bin) to system environment Path variables. The use the command 'psql -U postgres rdiploma'

### Endpoints

| Method | Endpoint                   | Description                                             |
|--------|----------------------------|---------------------------------------------------------|
| GET    | `/api/books`               | Get all books                                           |
| POST   | `/api/books`               | Add new book                                            |
| GET    | `/api/users`               | Get all users                                           |
| GET    | `/api/users/:id`           | Get a specific user                                     |
| POST   | `/api/users/register`      | Create new user                                         |
| POST   | `/auth/login`              | Login using basic credentials (email/username, password)|
| GET    | `/auth/logout`             | Logout                                                  |
| GET    | `/auth/google`             | Sign up or login using Google account                   |
| GET    | `/auth/update-profile/:id` | Redirect here after sign up with Gmail                  |
| PATCH  | `/auth/update-profile/:id` | Set name, avatar, grade after sign up with Gmail        |

### User model

```json
{
  "id": 1,
  "email": "email@email.com",
  "name": "Kalle",
  "password_hash": "asdfasdfjjo1jopjee9fru82ujwår¨rfa",
  "avatar": "path/avatar1.jpg",
  "current_reading": 1,
  "grade": 1,
  "role": "student"
}
```

### Example requests

**Create new user**

```bash
curl -X POST http://localhost:3001/api/users \
  -d '{
    "email": "email@email.com",
    "name": "Kalle",
    "name": "email@email.com",
    "password": "Password-1",
    "avatar": "path/avatar1.jpg",
    "grade": 1
    }'
```

**login using basic credentials**

```bash
curl -X POST http://localhost:3001/auth/login \
  -d '{
    "identifier": "email@email.com",
    "password": "Password-1"
    }'
```
