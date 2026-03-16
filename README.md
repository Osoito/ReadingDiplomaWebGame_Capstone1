# Reading Diploma Web Game (Capstone 1)
Repo for the course Capstone Project 1. The project is a web-based reading diploma for youth. The idea is to gamify reading books for the youth and that way, encourage them to read more. The solution should work on mobile and PC and have a responsive design. The teachers on the course provided a direction for our idea and in this project plan document we will explain how we are going to approach the solution. Primary and middle schools could be potential customers for this project.  

## Installation & Setup 
>Will be updated as the project progresses

### Prerequisites

- Node.js 18 or newer and npm
- PostgreSQL (https://www.postgresql.org/download/) installed and running
---
### Installation
### Backend
Create a .env file in the root of your backend which contains these parameters
```
# ∨∨∨ REQUIRED ∨∨∨
PORT=3001                                           #<--- Port where the backend will run
DB_PASSWORD=yourPostgresPassword                    #<--- Password set when installing PostgreSQL (password for DB_USER)
GOOGLE_CLIENT_ID=123                                #<--- Required for Google auth, not reavealed publicly!!!
GOOGLE_CLIENT_SECRET=123                            #<--- Required for Google auth, not reavealed publicly!!!
SESSION_SECRET=randomlyGeneratedStringOfCharacters  #<--- Generate this yourself (tools below)
# ∧∧∧ REQUIRED ∧∧∧

# ∨∨∨ Required in production environments, to set the Access-Control-Allow-Origin to service domain (locally it's http://localhost:3001/)
PUBLIC_URL=http://localhost:3001/

# ∨∨∨ optional ∨∨∨ These values will be set to these defaults if not defined here
NODE_ENV=development                                #<--- Environment mode (development/test/production), set by npm scripts
DB_HOST=localhost                                   #<--- Where the database is hosted, localhost if not defined
DB_PORT=5432                                        #<--- Port where your PostgreSQL database is running (5432 by default)
DB_USER=postgres                                    #<--- PostgreSQL username (postgres by default)
DB_NAME=rdiploma                                    #<--- Name of the database, 'rdiploma' if not defined
UNIT_TEST_DB_NAME=rdiplomatestunit                  #<--- Name of the database used for unit tests, 'rdiplomatestunit' if not defined
INTEGRATION_TEST_DB_NAME=rdiplomatestintegration    #<--- Name of the database used for integration tests, 'rdiplomatestintegration' if not defined
# ∧∧∧ optional ∧∧∧
```

>**IMPORTANT** GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are used for google authentication can't be uploaded to GitHub, but they will be provided to team members.

You can use the command below to generate the SESSION SECRET for the .env. Generators can be found online as well (e.g. [it-tools.tech/token-generator](https://it-tools.tech/token-generator))
>node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```bash
# Backend installation
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Running the Application

### Development mode

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
# API calls to /api are proxied to the backend (http://localhost:3001) automatically, via vite.config.js
```

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001, by default
```
---

### Production mode

**Terminal 2 - Frontend: (Production Build)**
```bash
cd frontend
npm run build    # Output in dist/
npm run preview  # Preview the production build locally
```

**Terminal 1 - Backend:**
```bash
cd backend
npm run start
# Application uses built frontend/dist/
```

## Frontend

The frontend is a React application with an embedded Phaser 3 game, built with Vite.

### Tech Stack
- **React 18** — UI framework
- **Phaser 3** — 2D game engine (renders the interactive maps and reading interface)
- **Vite** — Build tool and dev server

### Routing
The app uses React Router. Users land on a welcome page and choose a role:
- `/` — WelcomePage (role selection)
- `/login/teacher` — Teacher login (email + password)
- `/login/student` — Student login (teacher name + student name + password)
- `/teacher/dashboard` — Teacher dashboard (protected, teacher role only)
- `/game` — Phaser game (protected, student role only)

Auth state is managed by `AuthContext` (`src/contexts/AuthContext.jsx`) which checks the session via `GET /auth/me` on load.

> **Note:** Google OAuth requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env` (ask a team member for the values). Once set, teacher login via Google works normally. If you don't have the credentials, use the browser console snippets in the [Testing](#testing-without-google-auth) section instead.

### How It Works
The React app renders a `PhaserGame` component that creates and manages the Phaser game canvas. The game consists of:

- **World Map** — A hub scene with clickable buttons for each continent
- **Continent Maps** — 8 map scenes (Europe, Asia, Africa, Antarctica, Arctic, North America, South America, Oceania) where users follow a path of checkpoints and open books to read
- **Reading Scene** — An overlay that displays book content with scroll-based progress tracking

Game state (reading progress per continent, books read) is managed by a shared singleton in `src/game/state.js`.

### Frontend Project Structure
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
    │   ├── PhaserGame.jsx        # React wrapper for Phaser canvas
    │   ├── StudentManager.jsx    # Teacher dashboard: manage students
    │   └── BookManager.jsx       # Teacher dashboard: manage books
    ├── contexts/
    │   └── AuthContext.jsx       # Session auth state (useAuth hook)
    ├── pages/
    │   ├── WelcomePage.jsx       # Role selection landing page
    │   ├── TeacherLoginPage.jsx  # Teacher login form
    │   ├── StudentLoginPage.jsx  # Student login form
    │   └── TeacherDashboard.jsx  # Teacher dashboard
    ├── game/
    │   ├── config.js             # Phaser game config factory
    │   ├── state.js              # Shared game state (ReadingState)
    │   ├── data/                 # Book content modules
    │   └── scenes/               # All Phaser scene classes
    └── assets/                   # Map images and token PNGs
```

## Backend

### Tech Stack
### Runtime and Web framework

- **Node.js (ES module)** — Runtime environment
- **Express.js** — Web application framework
    - **express-rate-limit** rate limiting (login throttling)
    - **express-session** — session management
    - **memorystore** — session store to avoid memory leaks while using express-session

### Authentication
- **Passport.js** — Authentication middleware
    - **passport-local** — username/password login
    - **passport-google-oauth20** — Google OAuth 2.0 login
    - **passport-strategy** — Custom strategy used in test env

### Database & ORM / Query Builder
- **PostgreSQL** — Database
- **pg** — PostgreSQL driver
- **Knex.js** — SQL query builder + migrations + seeds
    - Automated DB creation for dev/test environments
    - Automatic migrations on npm install

### Testing
- **Vitests** — Unit & integration testing
- **supertest** — HTTP endpoint testing
- **@vitest/coverage-istanbul** — coverage reporting

### Utilities & tooling
- **dotenv** — Environment variable management
- **bcrypt** — Password hashing
- **zod** — Input validation
- **cross-env** — Environment variable compatibility across operating systems
- **nodemon** — Auto restart server when changes detected, in development env
- **eslint** + stylistic plugins — Linting and consistent code style
---

### Endpoints

| Method | Endpoint                             | Description                                                   |
|--------|--------------------------------------|---------------------------------------------------------------|
| GET    | `/api/books`                         | Get all books                                                 |
| POST   | `/api/books`                         | Add new book                                                  |
| DELETE | `/api/books/delete-book/:id`         | Deletes book(requires teacher role)                           |
| GET    | `/api/users`                         | Get all users                                                 |
| POST   | `/api/users/register`                | Create new user(also creates progress entries for new user)   |
| PATCH  | `/api/users/:id/role`                | Swaps the user role                                           |
| PATCH  | `/api/users/:id/change-password`     | Change user's password, needs currentPassword, password       |
| GET    | `/api/users/profile/:id`             | Get user profile                                              |
| PATCH  | `/api/users/profile/:id`             | Update profile info (name / avatar / grade)                   |
| POST   | `/api/progress/add-entry`            | Add a new progression entry                                   |
| PUT    | `/api/progress/:level/completed`     | Updates level entry for user as complete                      |
| GET    | `/api/progress/get-entry/:level`     | Gets specific level from current user                         |
| GET    | `/api/progress/current-level`        | Gets user's most recent incomplete level                      |
| PUT    | `/api/progress/:level/add-book`      | Changes the book attatched to a progress entry                |
| POST   | `/api/submissions/add-submission`    | adds a submission entry for the current user in current level |
| GET    | `/api/submissions/my-students/:id`   | Gets specific submission entry(needs teacher role)            |
| GET    | `/api/submissions/my-students`       | Gets current user's student submissions(requires teacher role)|
| DELETE | `/api/submissions/:id`               | Deletes specific submission entry(needs teacher role)         |
| POST   | `/auth/login`                        | Login using basic credentials (email/username, password)      |
| POST   | `/auth/logout`                       | Logout                                                        |
| GET    | `/auth/me`                           | Returns current session user                                  |
| GET    | `/auth/google`                       | Sign up or login using Google account                         |
| GET    | `/api/users/my-students`             | Get all students belonging to the logged-in teacher           |
| POST   | `/api/users/students`                | Create a student under the logged-in teacher                  |
| DELETE | `/api/users/students/:id`            | Delete a student (teacher must own the student)               |
| POST   | `/api/rewards/add-reward`            | Add a reward (avatar?) for user                               |
| GET    | `/api/rewards/:id`                   | Fetches all of user's rewards (requires teacher role)         |
| GET    | `/api/rewards/`                      | Fetches all of current user's rewards                         |

### Backend Project Structure
```
backend/
├── app.js                              # Backend main entry point
├── eslint.config.mjs                   # Configuration file for JavaScript linter
├── index.js                            # Boots up server and loads app.js
├── knexfile.js                         # Configuration file for knex
├── package.json
├── pnpm-lock.yaml                      # Required by the 'Backend CI' GitHub action
├── vitest.integration.config.js        # Configuration file for integration testing environment
├── vitest.unit.config.js               # Configuration file for unit testing enviorement
├── .env                                # File with secret environmental variables (not found on github)
├── controllers/                        # controllers/ includes all the API routes (get, post etc.)
│   ├── auth.js
│   ├── books.js
│   ├── progressController.js
│   ├── users.js
│   └── README.md
├── db/
│   ├── db.js                           # Creates and exports the knex database connection
│   ├── migrations/                     # Contains knex migrations (used to create and update database schema) 
│   │   ...
│   │   ├── migration.stub              # Template for the migration files
│   │   └── README.md
│   └── seeds/
│       ├── users_seed.js               # Populates (integration)database with users for testing
│       └── seed.stub                   # Template for seed files
├── models/                             # Models are used to make SQL requests to the database (called by services)
│   ├── book.js                         
│   ├── progress.js                     
│   ├── user.js                         
│   └── README.md
├── scripts/                            # Various scripts, used to automate actions (also used in testing)
│   ├── createDatabase.js               # Creates the postgres database for development and testing
│   └── removeTestDB.js                 # Removes the test database created after running tests
├── services/                           # Services are used by controllers to clean data, handle errors etc.
│   ├── bookService.js                  
│   ├── progressService.js              
│   ├── userService.js                  
│   └── README.md
├── tests/
│   ├── integration/                    # Integration tests
│   │   └── api_integration.test.js     # All integration tests, currently in one file so that they even work, could try to separate them later on if there is time.
│   ├── unit/                           # Unit tests
│   │   ├── models/                     # Tests for database interaction
│   │   │   ├── userModel.test.js
│   │   │   ├── bookModel.test.js
│   │   │   └── rewardModel.test.js
│   │   ├── services/                   # Unit tests for service functions
│   │   │   ├── userService.test.js
│   │   │   ├── bookService.test.js
│   │   │   └── rewardService.test.js
│   │   ├── bookControllerUnit.test.js
│   │   ├── rewardControllerUnit.test.js
│   │   └── user_api.test.js            # variety of tests for user functions
│   └── testConfig/                     # Test configuration files
│        ├── cleanTestDB.js             # Currently in use script to clean the database between tests, may be deleted at some point
│        ├── globalSetup.js             # Runs once when tests are started (Currently prepares testDB for integration tests)
│        ├── globalSetUpUnit.js         # Runs once when tests are started (Currently prepares testDB for unit tests)
│        ├── passport-mock.js           # Mocks local authentication
│        ├── test-strategy.js           # Used by the passport-mock to simulate local login
│        └── testHelper.js              # Currently just mocks users in Database
│        
│                    
└── utils/
    ├── config.js                       # Loads .env environmental variables
    ├── logger.js                       # Logs events and errors into the console
    ├── middleware.js                   # Contains middleware related to e.g. user authentication, error handling.
    └── passport.js                     # Passport for local- and google authentication
```

---
### psql from VSCode terminal (**optional**)
To use psql for database functions (CRUD and data viewing) in the VSCode terminal, add your PostgreSQL installation (e.g. C:\Program Files\PostgreSQL\18\bin) to system environment Path variables.

Instructions for Windows: [https://commandprompt.com/education/how-to-set-windows-path-for-postgres-tools](https://www.commandprompt.com/education/how-to-set-windows-path-for-postgres-tools/)

**useful psql commands**
- **psql -U postgres** <-- to open psql terminal interface (with the postgres user)
- **psql -U postgres rdiploma** <-- to open the rdiploma database in psql and make requests to it. (e.g. SELECT * FROM books;)
- **\l** <-- to view all databases
- **\dt** <-- to view all tables
- **\q** <-- to close psql
---

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
  "role": "student",
  "teacher_id": 2
}
```

## Testing without Google auth

If you don't have the Google OAuth credentials in your `.env`, you can log in via the browser console instead. Run these snippets at `http://localhost:5173`.

> **Important:** If you get `Unexpected end of JSON input` when running a snippet, it means you already have an active session. Clear it first using **Option B** in the Troubleshooting section (DevTools → Application → Cookies → delete session cookie), then run the snippet again.

**Teacher dashboard:**
```js
fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'TestTeacher', password: 'Test123!' })
}).then(r => r.json()).then(d => { console.log(d); window.location.href = '/teacher/dashboard' })
```

**Student dashboard — first create a student via the teacher dashboard, then:**
```js
fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '<student_name>', password: '<student_password>', teacher_name: 'TestTeacher' })
}).then(r => r.json()).then(d => { console.log(d); window.location.href = '/student/dashboard' })
```
Or directly log in through the login page by typing in the student credentials you just created.

## Troubleshooting

**Login page redirects straight to `/teacher/dashboard` or `/game`**
- Your browser still holds a session cookie from a previous login. The app correctly treats you as logged in and redirects you.
- **Option A (easiest):** Click the logout button in the Teacher Dashboard or Student game view to clear the session properly.
- **Option B (manual):** Open DevTools (`F12`) → **Application** tab → **Cookies** → `http://localhost:5173` → delete the session cookie entry → refresh the page.
- **Option C (console):** Run this snippet in the browser console to log out programmatically:
  ```js
  fetch('/auth/logout', { method: 'POST' }).then(() => window.location.href = '/')
  ```

**Dev server starts on port 5176 (or 5174/5175) instead of 5173**
- Multiple Vite instances are running from previous `npm run dev` calls that weren't stopped.
- Close all terminal windows that were running `npm run dev`, then start a fresh one. Port 5173 will be available again.
- Alternatively, in PowerShell: `Get-NetTCPConnection -LocalPort 5174,5175,5176 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`

**'Command failed with exit code 1.' when running `npm install` or `npm run db:create` in backend/**
- Create a .env file in **backend/** and add the required fields to it mentioned in the [Installation](https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1?tab=readme-ov-file#installation) part. After that, run `npm install` in **backend/** to install the package and create the required database.

**If migrations (in backend) have been edited**
- run `npx knex migrate:rollback --all` to rollback all migrations, then run `npx knex migrate:latest` to rerun all new migrations

**If new migrations have been added (in backend)**
- run `npx knex migrate:latest` to run all new migrations

**Can't connect to database (Constant internal server errors on requests)**
- On Windows: open services, find postgresql, ensure it says running.
- Ensure you have a .env file in the backend root, which contains the values mentioned above ([Installation](https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1?tab=readme-ov-file#installation)).
- PostgreSQL might not always be running on port:5432 (e.g. if it's already in use). Check which port PostgreSQL is running on. With psql ([psql from VSCode terminal](https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1?tab=readme-ov-file#psql-from-VSCode-terminal-optional)) run:  `psql -h localhost -U postgres`, then run: `SHOW port;` Then update the shown port number to your .env file DB_PORT.

[ Not sure if this is needed anymore
fetch('/auth/update-profile/9', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bartholomew', avatar: 'path/avatar1.jpg', grade: 1 })
}) ]: #

[ To log a student out, until logout button is implemented
fetch('/auth/logout', {
    method: 'POST',
}) ]: #
