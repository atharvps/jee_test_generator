# JEE Mock Test Generator & Exam Simulator

A full-stack MERN application for JEE preparation with real exam simulation.

## Features

### Student Portal
- Generate personalized mock tests (Physics, Chemistry, Mathematics)
- Real exam interface with 3-hour timer, question palette, mark for review
- Auto-submit when time expires
- JEE scoring: +4 Correct, -1 Incorrect, 0 Unattempted
- Detailed result review with solutions
- Analytics with charts (score history, accuracy trends, subject-wise performance)

### Instructor Portal
- Manage question bank (CRUD operations)
- Create official tests by selecting questions
- View all student results and activity
- Analytics dashboard with class performance
- Student leaderboard with rankings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (role-based: student / instructor) |
| Deployment | Vercel (frontend) + Render (backend) |

## Quick Start

### Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, CLIENT_URL, PORT
npm run seed     # seed sample questions + demo accounts
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

## Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Student | student@jee.com | Student@123 |
| Instructor | instructor@jee.com | Instructor@123 |

## Environment Variables

### Backend (`server/.env`)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLIENT_URL=https://your-frontend.vercel.app
PORT=5000
```

### Frontend (`client/.env`)
```
VITE_API_URL=https://your-backend.onrender.com
```

## Deployment

### Backend → Render
1. Push `server/` to GitHub
2. Create Web Service on Render
3. Build: `npm install` | Start: `npm start`
4. Add environment variables

### Frontend → Vercel
1. Push `client/` to GitHub
2. Import project on Vercel
3. Add `VITE_API_URL` environment variable

## API Endpoints

| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |
| GET | /api/questions | Instructor |
| POST | /api/questions | Instructor |
| PUT | /api/questions/:id | Instructor |
| DELETE | /api/questions/:id | Instructor |
| POST | /api/tests/generate | Student |
| GET | /api/tests/:id | Private |
| POST | /api/results/submit | Student |
| GET | /api/results/my-results | Student |
| GET | /api/analytics/student | Student |
| GET | /api/analytics/instructor | Instructor |
| GET | /api/analytics/leaderboard | Instructor |
