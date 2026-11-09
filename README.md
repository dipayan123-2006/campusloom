# CampusLoom – Student Portal (MERN)

React + React Router frontend, Express + MongoDB (Mongoose) backend, JWT auth.

## Unique features
- Auto-generated roll numbers (e.g. `CL26-CO-0001`) per department/year
- Dashboard "Timetable Loom": enrol in courses and watch your weekly timetable weave itself, with clash detection
- Live password-strength meter on registration
- Light/dark theme toggle, responsive navbar with mobile drawer

## Run
1. Start MongoDB locally (or use Atlas) and copy `server/.env.example` to `server/.env`.
2. `cd server && npm install && npm start`   (http://localhost:5000)
3. `cd client && npm install && npm run dev` (http://localhost:5173, proxies /api to the server)

## Routes
/ Home · /register · /login · /dashboard (protected) · /contact · /about

## Deploy (Render + MongoDB Atlas)
See the steps in chat: push to GitHub, then Render > New > Blueprint, paste your Atlas string as MONGO_URI.
