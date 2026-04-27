# Reading Diploma Web Game (Capstone 1)
Repo for the course Capstone Project 1. The project is a web-based reading diploma for youth. The idea is to gamify reading books for the youth and that way, encourage them to read more. The solution should work on mobile and PC and have a responsive design. The teachers on the course provided a direction for our idea. Primary and middle schools could be potential customers for this project.  

## Deployed version (easy testing)
The application is deployed in a free render instance, which can be tested by anyone here https://lukudiplomi.onrender.com/.
>**Note**: The database used in the free render instance expires on May 10, 2026. After which the deployment will not work properly unless a new database is setup (I will not be setting up a new database every month).

## Installation & Setup 

### Prerequisites

- Node.js 18 or newer and npm
- PostgreSQL (https://www.postgresql.org/download/) installed and running
---
### Installation
### Backend
Create a .env file in the root of your backend which contains AT LEAST these required parameters. The optional parameters can be used to configure the database connection and names incase default values don't work.
```
# ∨∨∨ REQUIRED ∨∨∨
PORT=3001                                           #<--- Port where the backend will run
DB_PASSWORD=yourPostgresPassword                    #<--- Password set when installing PostgreSQL (password for DB_USER)
GOOGLE_CLIENT_ID=123                                #<--- Required for Google auth, not reavealed publicly!!!
GOOGLE_CLIENT_SECRET=123                            #<--- Required for Google auth, not reavealed publicly!!!
SESSION_SECRET=randomlyGeneratedStringOfCharacters  #<--- Generate this yourself (tools below)
# ∧∧∧ REQUIRED ∧∧∧

# ∨∨∨ Required in production environments, to set the Access-Control-Allow-Origin to service domain
PUBLIC_URL=http://localhost:3001/         #<--- server domain when running locally
# ∧∧∧ Production ∧∧∧

# ∨∨∨ optional ∨∨∨ These values will be set to these defaults if not defined here
DB_HOST=localhost                                 #<--- Where the database is hosted, localhost if not defined
DB_PORT=5432                                      #<--- Port where your PostgreSQL database is running (5432 by default)
DB_USER=postgres                                  #<--- PostgreSQL username (postgres by default)
DB_NAME=rdiploma                                  #<--- Name of the database, 'rdiploma' if not defined
NODE_ENV=development                              #<--- Environment mode (development/test/production), set by npm scripts

UNIT_TEST_DB_NAME=rdiplomatestunit                #<--- Name of the database used for unit tests, 'rdiplomatestunit' if not defined
INTEGRATION_TEST_DB_NAME=rdiplomatestintegration  #<--- Name of the database used for integration tests, 'rdiplomatestintegration' if not defined
# ∧∧∧ optional ∧∧∧
```

>**IMPORTANT** GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are used for google authentication can't be uploaded to GitHub, **Google authentication will not work without them**. The team members have these values. Alternatively you can create your own project in the Google cloud api console (https://console.developers.google.com/) and use the values provided there. More detailed instructions (for developers creating your own project) can be found at https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid.

>If you don't have the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, you can also use the browser console snippets in the [Testing](#testing-without-google-auth) section instead. **Requires you to create a testing teacher account first**

You can use the command `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` to generate the SESSION SECRET for the .env file. Generators can also be found online (e.g. [it-tools.tech/token-generator](https://it-tools.tech/token-generator)).

```bash
# Backend installation
# Creates required PostgreSQL database, installs required packages, and runs migrations .
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
# npm run start also checks if frontend/dist/ exists and builds it if it doesn't exist (check doesn't work in powershell or cmd).
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
    - **express-rate-limit** — rate limiting (login throttling)
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
- **Vitest** — Unit & integration testing
- **supertest** — HTTP endpoint testing
- **@vitest/coverage-istanbul** — coverage reporting

### Utilities & tooling
- **dotenv** — Environment variable management
- **cross-env** — Environment variable compatibility across operating systems
- **bcrypt** — Password hashing
- **zod** — Input validation
- **nodemon** — Auto restart server when changes detected (hotreload), in development env
- **eslint** + stylistic plugins — Linting and consistent code style
---

### Endpoints

| Method | Endpoint                             | Description                                                    |
|--------|--------------------------------------|----------------------------------------------------------------|
| GET    | `/api/books`                         | Get all books                                                  |
| POST   | `/api/books`                         | Add new book                                                   |
| DELETE | `/api/books/delete-book/:id`         | **Unused** Deletes book       |
||||
| GET    | `/api/users`                         | **Unused** Get all users      |
| POST   | `/api/users/register`                | **Unused** Create new user (also creates progress entries for new user)|
| PATCH  | `/api/users/:id/role`                | **Unused** Swaps the user role|
| PATCH  | `/api/users/:id/change-password`     | **Unused** Change user's password (needs currentPassword, password)|
| GET    | `/api/users/profile/:id`             | **Unused** Get user profile   |
| PATCH  | `/api/users/profile/:id`             | Update profile info (name / avatar / grade)                    |
||||
| GET    | `/api/users/my-students`             | Get all students belonging to the logged-in teacher            |
| POST   | `/api/users/students`                | Create a student under the logged-in teacher                   |
| DELETE | `/api/users/students/:id/password`   | Change the student's password                                  |
| DELETE | `/api/users/students/:id`            | Delete a student                                               |
||||
| GET    | `/api/progress`                      | Fetches all current user's progress entries                    |
| POST   | `/api/progress/add-entry`            | **Unused** Add a new progression entry|
| PUT    | `/api/progress/:level/completed`     | Updates level entry for user as complete                       |
| PUT    | `/api/progress/:level/status`        | Updates level status for student (incomplete/complete/reviewed)|
| GET    | `/api/progress/get-entry/:level`     | **Unused** Gets specific level from current user|
| GET    | `/api/progress/student/:id`          | Gets specified student's progress                              |
| GET    | `/api/progress/current-level`        | Gets user's most recent incomplete level                       |
| PUT    | `/api/progress/:level/add-book`      | Changes the book attached to a progress entry                  |
||||
| POST   | `/api/submissions/add-submission`    | adds a submission entry for the current user in current level  |
| GET    | `/api/submissions/my-students/:id`   | **Unused** Gets specific submission entry|
| GET    | `/api/submissions/my-students`       | **Unused** Gets current user's student submissions|
| GET    | `/api/submissions/student/:id`       | Gets specified student's submissions                           |
| GET    | `/api/submissions`                   | Gets user's submissions                                        |
| DELETE | `/api/submissions/:id`               | **Unused** Deletes specific submission entry|
||||
| POST   | `/api/rewards/add-reward`            | Add a reward (avatar?) for user                                |
| GET    | `/api/rewards/:id`                   | **Unused** Fetches all of user's rewards|
| GET    | `/api/rewards`                       | Fetches all of current user's rewards                          |
||||
| POST   | `/auth/login`                        | Login using basic credentials (username, password)             |
| POST   | `/auth/logout`                       | Logout                                                         |
| GET    | `/auth/me`                           | Returns current session user                                   |
| GET    | `/auth/google`                       | Sign up or login using Google account                          |
| GET    | `/auth/google/callback`              | Redirects back to app frontend after login with Google         |
---

### Backend Project Structure
```
backend/
├── app.js                              # Backend main entry point
├── eslint.config.mjs                   # Configuration file for JavaScript linter (code style)
├── index.js                            # Boots up server and loads app.js
├── knexfile.js                         # Configuration file for Knex
├── package.json
├── pnpm-lock.yaml                      # Required by the 'Backend CI' GitHub action
├── vitest.integration.config.js        # Configuration file for integration testing environment
├── vitest.unit.config.js               # Configuration file for unit testing environment
├── .env                                # File with secret environmental variables (not found on github)
├── controllers/                        # controllers/ includes all the API routes (get, post etc.)
│   ├── auth.js
│   ├── books.js
│   ├── progressController.js
│   ├── users.js
│   ├── submissions.js
│   ├── rewards.js
│   └── README.md
├── db/
│   ├── db.js                           # Creates and exports the knex database connection
│   ├── migrations/                     # Contains knex migrations (used to create and update database schema) 
│   │   ...
│   │   ├── migration.stub              # Template for the migration files
│   │   └── README.md
│   └── seeds/
│       ├── users_seed.js               # Populates (integration) database with users for testing
│       └── seed.stub                   # Template for seed files
├── models/                             # Models are used to make SQL requests to the database (called by services)
│   ├── book.js                         
│   ├── progress.js                     
│   ├── user.js   
│   ├── submission.js
│   ├── reward.js                 
│   └── README.md
├── scripts/                            # Various scripts, used to automate actions (also used in testing)
│   ├── createDatabase.js               # Creates the postgres database for development and testing
│   └── removeTestDB.js                 # Removes the test database created after running tests
├── services/                           # Services are used by controllers to clean data, handle errors etc.
│   ├── bookService.js                  
│   ├── progressService.js              
│   ├── userService.js
│   ├── submissionService.js
│   ├── rewardService.js                  
│   └── README.md
├── tests/
│   ├── integration/                    # Integration tests
│   │   └── api_integration.test.js     # All integration tests
│   ├── unit/                           # Unit tests
│   │   ├── controllers/                # Unit Tests for controller routes
│   │   │   ├── bookControllerUnit.test.js
│   │   │   ├── progressControllerUnit.test.js
│   │   │   ├── rewardControllerUnit.test.js
│   │   │   └── submissionsControllerUnit.test.js
│   │   ├── models/                     # Unit Tests for database interaction
│   │   │   ├── userModel.test.js
│   │   │   ├── bookModel.test.js
│   │   │   ├── rewardModel.test.js
│   │   │   ├── submissionModel.test.js
│   │   │   └── progressModel.test.js
│   │   ├── services/                   # Unit tests for service functions
│   │   │   ├── userService.test.js
│   │   │   ├── bookService.test.js
│   │   │   ├── rewardService.test.js
│   │   │   ├── submissionService.test.js
│   │   │   └── progressService.test.js
│   │   └── user_api.test.js            # variety of tests for user functions
│   └── testConfig/                     # Test configuration files
│        ├── cleanTestDB.js             # Currently in use script to clean the database between tests, may be deleted at some point
│        ├── globalSetup.js             # Runs once when tests are started (Currently prepares testDB for integration tests)
│        ├── globalSetUpUnit.js         # Runs once when tests are started (Currently prepares testDB for unit tests)
│        ├── passport-mock.js           # Mocks local authentication
│        ├── test-strategy.js           # Used by the passport-mock to simulate local login
│        └── testHelper.js              # Currently just mocks users in Database
│                    
└── utils/
    ├── config.js                       # Loads .env environmental variables
    ├── logger.js                       # Logs events and errors into the console
    ├── middleware.js                   # Contains middleware related to e.g. authorization, error handling.
    └── passport.js                     # Passport for local- and google authentication
```
---

### Backend Testing Instructions
The backend has unit and integration tests.

To run tests in the backend use: `npm test`, which runs all tests.

To run only unit tests use: `npm run unit`

To run only integration tests use: `npm run integration`

Unit and integration tests are run in different environments to avoid conflicts.

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

### Development phase

**Can't test endpoints using REST client**
- Error: 'Invalid CSRF token': comment out app.use(lusca({...})) for the duration of testing (It creates the csrf token requirement. Applies to all REST clients).
- If using **Thunder client**, after commenting out the lusca part, Error: 'Unauthorized' on every other endpoint except auth/**: reason for this is still unknown, but this problem doesn't appear when using Postman, so consider using that, or another REST client instead.
- **FYI**: The reason for the 'Invalid CSRF token' error is that the X-CSRF-TOKEN header needs to be set on every request, but the value required for it also changes every request and changing it in REST client after every request is very tedious, so it's easier to just disable it for the duration of testing. In the frontend the header gets fetched from a cookie or the auth/csrf-token endpoint, before any request.

**Error: 'Invalid CSRF token' on request via frontend/UI**
- post, put, patch or delete fetch request is likely missing X-CSRF-TOKEN header. Add the header according to the instructions at [backend/app.js](https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1/blob/main/backend/app.js) (At the part that says 'Set the X-CSRF-TOKEN header in the frontend like this').

**Error: 'Liian monta pyyntöä. Yritä uudelleen X sekunnin kuluttua.' on request**
- This happens due to request rate limiting applied in [backend/app.js](https://github.com/Osoito/ReadingDiplomaWebGame_Capstone1/blob/main/backend/app.js). Adjust the requests / time window (max/windowMs) accordingly if this error happens during regular application use. This is used to fend off Denial-of-Service attacks.

### Running the application

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
