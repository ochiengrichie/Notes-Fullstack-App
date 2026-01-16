# Notes App

A full-stack note-taking application with secure user authentication, real-time search, and production-level security practices.

##  Features

- **User Authentication** — Email/password registration with strength validation, JWT tokens, refresh tokens
- **Google OAuth** — One-click login with Google
- **CRUD Operations** — Create, read, update, and delete notes
- **Search & Filter** — Real-time search across note titles and contents
- **Pagination** — Efficient note loading with limit/offset
- **Rate Limiting** — Brute-force protection on login/register (5 attempts per 15 minutes)
- **Input Validation** — Email format, password strength, note size limits (50K chars max)
- **Security** — SQL injection prevention, secure cookies, bcrypt password hashing

## Tech Stack

**Frontend:**
- React 18
- Vite
- Axios

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- express-rate-limit

**Authentication:**
- JWT + Refresh Tokens
- Google OAuth 2.0
- httpOnly Secure Cookies

##  Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

##  Installation

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=notes_app
PG_PASSWORD=your_password
PG_PORT=5432

PORT=5000

JWT_SECRET=your_long_random_secret_at_least_32_chars
REFRESH_TOKEN_SECRET=your_long_random_refresh_secret_at_least_32_chars

CLIENT_ID=your_google_oauth_client_id
```

Start the backend:

```bash
npm start
# or with nodemon for development
npx nodemon server.js
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend-vite
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

##  API Endpoints

### Users
- `POST /api/v1/users/register` — Create new user
- `POST /api/v1/users/login` — Login with email/password
- `POST /api/v1/users/google` — Login with Google OAuth
- `POST /api/v1/users/refresh` — Refresh JWT token
- `POST /api/v1/users/logout` — Logout (clear cookies)

### Notes
- `GET /api/v1/notes?page=1&limit=20&q=search` — Fetch notes with pagination & search
- `POST /api/v1/notes` — Create new note
- `PUT /api/v1/notes/:id` — Update note
- `DELETE /api/v1/notes/:id` — Delete note

##  Security Features

- **Password Validation** — 8+ chars, uppercase, lowercase, number, special char
- **Email Validation** — RFC 5322 compliant email format checking
- **Rate Limiting** — 5 login attempts per 15 minutes, 100 general requests per 15 minutes
- **Request Size Limits** — Max 10MB JSON/form data
- **SQL Injection Prevention** — Parameterized queries with pg library
- **Secure Cookies** — httpOnly, sameSite, secure flags for HTTPS
- **Password Hashing** — bcrypt with 10 salt rounds
- **Environment Validation** — Fails immediately if required config missing

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255),
  auth_provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  contents TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

##  What I Learned

- **Full-stack architecture** — Building cohesive frontend and backend with proper separation of concerns
- **JWT authentication** — Implementing token-based auth with refresh token rotation
- **Database design** — Proper schema, relationships, and indexing
- **Security best practices** — Input validation, rate limiting, secure password storage, SQL injection prevention
- **API design** — RESTful endpoints with proper HTTP methods and status codes
- **Error handling** — Meaningful error messages and graceful failure recovery
- **Production mindset** — Environment configuration, graceful shutdown, connection pooling

##  Future Improvements

- Add password reset/forgot password flow
- Implement 2FA (Two-Factor Authentication)
- Add note sharing between users
- Add note categories/tags
- Add rich text editor (Markdown)
- Add dark mode
- Add note export (PDF, JSON)
- Comprehensive test suite (Jest)
- API documentation (Swagger/OpenAPI)
- Deployment guides

##  Environment Variables

See `.env.example` for all required variables and their descriptions.

##  License

MIT

##  Author

Richard

