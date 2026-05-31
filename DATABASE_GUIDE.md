# Database Setup Guide

## Recommended: Supabase (PostgreSQL)

Supabase is the best choice for this app — free tier, PostgreSQL, real-time, built-in auth,
and an easy SDK for React Native.

### Step 1 — Create a Supabase project
1. Go to https://supabase.com and sign up (free)
2. Click **New Project**
3. Choose a name (e.g. "trackr"), set a strong database password, pick a region
4. Wait ~2 minutes for it to provision

### Step 2 — Run the schema
1. In your project dashboard, click **SQL Editor** → **New Query**
2. Open `backend/src/models/schema.sql`
3. Paste the entire file into the editor and click **Run**
4. All four tables will be created: `users`, `tasks`, `budget_entries`, `time_sessions`

### Step 3 — Get your connection string
1. In Supabase dashboard → **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 4 — Configure the backend
1. Copy `backend/.env.example` to `backend/.env`
2. Paste your connection string as `DATABASE_URL`
3. Set a strong `JWT_SECRET`
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@db.abcxyz.supabase.co:5432/postgres
   JWT_SECRET=some_very_long_random_secret_string_here
   PORT=3000
   ```

### Step 5 — Configure the mobile app
Open `mobile/src/services/api.ts` and update `API_BASE`:
- For local development: `http://localhost:3000/api` (already set)
- For a deployed backend: `https://your-api.com/api`

---

## Alternative: Local PostgreSQL

If you prefer running PostgreSQL locally:

1. Install PostgreSQL 16 from https://postgresql.org/download
2. Create a database:
   ```sql
   CREATE DATABASE trackr;
   ```
3. Run the schema:
   ```bash
   psql -U postgres -d trackr -f backend/src/models/schema.sql
   ```
4. Set in `.env`:
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/trackr
   ```

---

## Alternative: Firebase (NoSQL)

If you prefer Firebase / Firestore:
- Collections: `users`, `tasks`, `budget_entries`, `time_sessions`
- Use `@react-native-firebase/app` and `@react-native-firebase/firestore`
- Replace the `api.ts` calls with Firestore SDK calls
- Firebase also provides Auth, removing the need for the custom backend auth

---

## Running the Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run dev        # development (nodemon)
npm start          # production
```

Test it:
```bash
curl http://localhost:3000/health
# → { "status": "ok", ... }
```

---

## Running the Mobile App

```bash
cd mobile
npm install
npx expo start
```

- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Scan QR code with **Expo Go** app on your real device

---

## API Endpoints Reference

### Auth
| Method | Endpoint            | Description     |
|--------|---------------------|-----------------|
| POST   | /api/auth/register  | Create account  |
| POST   | /api/auth/login     | Sign in         |
| GET    | /api/auth/me        | Get current user|

### Tasks
| Method | Endpoint        | Description        |
|--------|-----------------|--------------------|
| GET    | /api/tasks      | Get all tasks      |
| POST   | /api/tasks      | Create task        |
| PUT    | /api/tasks/:id  | Update task        |
| DELETE | /api/tasks/:id  | Delete task        |

### Budget
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | /api/budget         | Get all entries      |
| GET    | /api/budget/summary | Monthly totals       |
| POST   | /api/budget         | Create entry         |
| PUT    | /api/budget/:id     | Update entry         |
| DELETE | /api/budget/:id     | Delete entry         |

### Time Tracking
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/time             | Get sessions       |
| GET    | /api/time/today       | Today's summary    |
| POST   | /api/time/start       | Start session      |
| PUT    | /api/time/:id/stop    | Stop session       |
| DELETE | /api/time/:id         | Delete session     |

All protected endpoints require header: `Authorization: Bearer <token>`

---

## Production Deployment

### Backend
- **Railway** (recommended): https://railway.app — connect your GitHub repo, add env vars, auto-deploys
- **Render**: https://render.com — free tier available
- **Fly.io**: great for Node.js apps

### Mobile
- **Expo Application Services (EAS)**: `npx eas build` → build APK/IPA
- **Google Play** / **Apple App Store**: submit the EAS build
- For internal testing: `npx expo export` + share the APK
