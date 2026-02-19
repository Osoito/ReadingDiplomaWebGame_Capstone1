# Reading Diploma Web Game (Capstone 1)
Repo for the course Capstone Project 1. The project is a web-based reading diploma for youth. The idea is to gamify reading books for the youth and that way, encourage them to read more. The solution should work on mobile and PC and have a responsive design. The teachers on the course provided a direction for our idea and in this project plan document we will explain how we are going to approach the solution. Primary and middle schools could be potential customers for this project.  

## Installation & Setup 
>Will be updated as the project progresses

### Prerequisites

- Node.js 18 or newer and npm
- PostgreSQL (https://www.postgresql.org/download/) installed and running

### Installation
### Backend
Create a .env file in the root of your backend which contains these parameters
```
PORT=3001                           #<--- Port where the backend will run
NODE_ENV=development                #<--- Environment mode (development/test/production)

DB_HOST=localhost
DB_PORT=5432                        #<--- Port where your PostgreSQL database is running (5432=default)
DB_USER=postgres                    #<--- PostgreSQL username (postgres by default)
DB_PASSWORD=yourPostgresPassword    #<--- Password set when installing PostgreSQL (password for DB_USER)
DB_NAME=rdiploma                    #<--- Name of the database (rdiploma, if created using the script)
TEST_DB_NAME=rdiplomatest           #<--- Name of the database, used by model tests

GOOGLE_CLIENT_ID=123
GOOGLE_CLIENT_SECRET=123

SESSION_SECRET=randomlyGeneratedStringOfCharacters
```
GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are used for google authentication and i can't upload them to GitHub, but they will be provided to team members.

You can use the command below to generate the SESSION SECRET for the .env. Generators can be found online as well (e.g. [it-tools.tech/token-generator](https://it-tools.tech/token-generator))
>node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```bash
# Backend installation
cd backend
npm install
npm run db:create
npm knex migrate:latest
```

### Frontend
```bash
cd frontend
npm install
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
# API calls to /api are proxied to the backend automatically
```
---
### psql from VSCode terminal (**optional**)
(**Optional**) To use psql for database functions (CRUD and data viewing) in the VSCode terminal, add your PostgreSQL installation (e.g. C:\Program Files\PostgreSQL\18\bin) to system environment Path variables.

Instructions for Windows: [https://commandprompt.com/education/how-to-set-windows-path-for-postgres-tools](https://www.commandprompt.com/education/how-to-set-windows-path-for-postgres-tools/)

**useful psql commands**
- **psql -U postgres** <-- to open psql terminal interface (with the postgres user)
- **psql -U postgres rdiploma** <-- to open the rdiploma database in psql and make requests to it. (e.g. SELECT * FROM books;)
- **\l** <-- to view all databases
- **\dt** <-- to view all tables
- **\q** <-- to close psql
---

### Production Build (Frontend)
```bash
cd frontend
npm run build    # Output in dist/
npm run preview  # Preview the production build locally
```

## Frontend

The frontend is a React application with an embedded Phaser 3 game, built with Vite.

### Tech Stack
- **React 18** — UI framework
- **Phaser 3** — 2D game engine (renders the interactive maps and reading interface)
- **Vite** — Build tool and dev server

### How It Works
The React app renders a `PhaserGame` component that creates and manages the Phaser game canvas. The game consists of:

- **World Map** — A hub scene with clickable buttons for each continent
- **Continent Maps** — 8 map scenes (Europe, Asia, Africa, Antarctica, Arctic, North America, South America, Oceania) where users follow a path of checkpoints and open books to read
- **Reading Scene** — An overlay that displays book content with scroll-based progress tracking

Game state (reading progress per continent, books read) is managed by a shared singleton in `src/game/state.js`.

### Project Structure
```
frontend/
├── index.html                    # Vite entry point
├── vite.config.js                # Vite config (API proxy to backend)
├── package.json
└── src/
    ├── main.jsx                  # React entry
    ├── App.jsx                   # Root component
    ├── App.css                   # Global styles
    ├── components/
    │   └── PhaserGame.jsx        # React wrapper for Phaser canvas
    ├── game/
    │   ├── config.js             # Phaser game config factory
    │   ├── state.js              # Shared game state (ReadingState)
    │   ├── data/                 # Book content modules
    │   └── scenes/               # All Phaser scene classes
    └── assets/                   # Map images and token PNGs
```

## Backend

### Endpoints

| Method | Endpoint                         | Description                                             |
|--------|----------------------------------|---------------------------------------------------------|
| GET    | `/api/books`                     | Get all books                                           |
| POST   | `/api/books`                     | Add new book                                            |
| GET    | `/api/users`                     | Get all users                                           |
| GET    | `/api/users/:id`                 | Get a specific user                                     |
| POST   | `/api/users/register`            | Create new user                                         |
| PATCH  | `/api/users/:id/role`            | Swaps the user role                                     |
| PATCH  | `/api/users/:id/change-password` | Change user's password, needs currentPassword,password  |
| POST   | `/api/progress/add-entry`        | Add a progression new entry                             |
| PUT    | `/api/progress/:level/completed` | Updates level entry for user as complete                |
| POST   | `/auth/login`                    | Login using basic credentials (email/username, password)|
| GET    | `/auth/logout`                   | Logout                                                  |
| GET    | `/auth/google`                   | Sign up or login using Google account                   |
| GET    | `/auth/update-profile/:id`       | Redirect here after sign up with Gmail                  |
| PATCH  | `/auth/update-profile/:id`       | Set name, avatar, grade after sign up with Gmail        |

### User model

```json
{
  "id": 1,
  "email": "john@doe.com",
  "name": "John",
  "password_hash": "asdfasdfjjo1jopjee9fru82ujwarprfaa",
  "avatar": "path/avatar1.jpg",
  "currently_reading": 1,
  "grade": 1,
  "role": "student"
}
```

### Example requests

**Create new user**

```bash
curl -X POST http://localhost:3001/api/users \
  -d '{
    "email": "john@doe.com",
    "name": "John",
    "password": "Password-1",
    "avatar": "path/avatar1.jpg",
    "grade": 1
    }'
```

**login using basic credentials**

```bash
curl -X POST http://localhost:3001/auth/login \
  -d '{
    "identifier": "john@doe.com",
    "password": "Password-1"
    }'
```

## Troubleshooting

**If migrations (in backend) have been edited**
- run 'npx knex migrate:rollback --all' --> to rollback all migrations, then run 'npx knex migrate:latest' to rerun all new migrations

**If new migrations have been added (in backend)**
- run 'npx knex migrate:latest' to run all new migrations

**Can't connect to database (Constant internal server errors on requests)**
- On Windows: open services, find postgresql, ensure it says running.
- Ensure you have a .env file in the backend root, which contains the values mentioned above ([Installation](https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1?tab=readme-ov-file#installation)).
- PostgreSQL might not always be running on port:5432 (e.g. if it's already in use). Check which port PostgreSQL is running on. With psql run:  **psql -h localhost -U postgres**, then run: **SHOW port;** Then update the port number to your .env file DB_PORT. [psql from VSCode terminal](https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1?tab=readme-ov-file#psql-from-VSCode-terminal-optional)
