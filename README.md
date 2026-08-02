# FitTracker

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Django REST Framework, with SimpleJWT for authentication
- **Database:** PostgreSQL

## Local Setup

1. Navigate to the frontend folder:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Confirm `API_BASE_URL` in `src/auth.js` is set to `https://fittracker-4cqg.onrender.com` — the deployed backend
4. Start the dev server:
   ```
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (Vite's default local dev server address).
5. Open the app in your browser and register a new account, or use the **"Continue as Guest"** option to browse without registering.