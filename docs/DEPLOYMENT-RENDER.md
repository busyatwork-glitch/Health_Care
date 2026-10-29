# Deploying the AI Healthcare Platform to Render

This guide outlines how to deploy the **AI Healthcare Platform** to [Render](https://render.com) using either the automated Blueprint or manual Web Service setup.

---

## 1. Prerequisites

1. **GitHub Repository**: [https://github.com/busyatwork-glitch/Health_Care.git](https://github.com/busyatwork-glitch/Health_Care.git)
2. **Render Account**: Sign up for free at [render.com](https://render.com).
3. **PostgreSQL Database**:
   - A free database on [Supabase](https://supabase.com) (recommended) or [Neon](https://neon.tech).
4. **Google Gemini API Key**:
   - Get a free API key from [Google AI Studio](https://aistudio.google.com).

---

## 2. Database Setup

1. In your **Supabase Dashboard** (or Postgres provider):
   - Go to **SQL Editor**.
   - Open and copy the contents of [`server/supabase/schema.sql`](../server/supabase/schema.sql).
   - Run the SQL script to create all required tables, indexes, and constraints.
2. (Optional) Run Initial Seed Data:
   - To populate sample doctors and hospitals locally into the database, add your database URL to your local `.env`:
     ```env
     SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
     ```
   - Run:
     ```bash
     npm run seed
     ```
3. Copy your database connection string:
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`
   - Ensure SSL is enabled (Supabase connection strings usually include `sslmode=require`).

---

## 3. Deployment on Render

### Option A: 1-Click Blueprint (Recommended)

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub account and select the repository: `busyatwork-glitch/Health_Care`.
4. Render will read [`render.yaml`](../render.yaml) and automatically configure:
   - **Service Name**: `healthcare-platform`
   - **Runtime**: Node.js
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
   - **Secrets Auto-Generation**: `JWT_SECRET` and `JWT_REFRESH_SECRET` are automatically generated cryptographically.
5. In the prompt for missing variables, enter:
   - `SUPABASE_DB_URL`: Your Supabase connection string.
   - `GEMINI_API_KEY`: Your Google Gemini API key.
6. Click **Apply**.
7. Render will build and deploy the full application. Once finished, your platform will be live at `https://healthcare-platform-xxxx.onrender.com`.

---

### Option B: Manual Web Service Setup

If you prefer configuring the Web Service manually:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository `busyatwork-glitch/Health_Care`.
3. Configure the following settings:
   - **Name**: `healthcare-platform`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Region**: Choose closest to your users (e.g., `Oregon`, `Frankfurt`, or `Singapore`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** and set **Health Check Path** to `/api/health`.
5. Add the following **Environment Variables**:

| Variable             | Value                     | Description                        |
| -------------------- | ------------------------- | ---------------------------------- |
| `NODE_ENV`           | `production`              | Enables production mode & security |
| `COOKIE_SECURE`      | `true`                    | Secure HTTPS cookies               |
| `APP_TIME_ZONE`      | `Asia/Kolkata`            | Application timezone               |
| `SUPABASE_DB_URL`    | `postgresql://...`        | Postgres connection string         |
| `GEMINI_API_KEY`     | `AIza...`                 | Google Gemini API key              |
| `GEMINI_MODEL`       | `gemini-3.8-flash`        | Gemini model name                  |
| `JWT_SECRET`         | _(Random 32+ characters)_ | Secret for auth tokens             |
| `JWT_REFRESH_SECRET` | _(Random 32+ characters)_ | Secret for refresh tokens          |
| `RESEND_API_KEY`     | `re_...` (Recommended)    | Free Resend API key for OTP emails (Render Free tier blocks SMTP ports 25/465/587) |
| `RESEND_FROM`        | `Carekind <onboarding@resend.dev>` | From address for Resend emails |

> [!NOTE]
> **Email Delivery on Render Free Tier**:
> Render's free tier blocks outbound traffic on SMTP ports `25`, `465`, and `587`. If you configure Gmail SMTP on a free instance, you will get a `Connection timeout` error. To send real emails without upgrading to a paid Render plan, sign up for free at [resend.com](https://resend.com) (3,000 free emails/month) and set the `RESEND_API_KEY` environment variable. Resend uses standard HTTPS (port 443), which Render never blocks.

6. Click **Create Web Service**.

---

## 4. Verifying Deployment

1. Once the deployment finishes, open your Render service URL (e.g., `https://<service-name>.onrender.com`).
2. Test the following:
   - **Health check**: Visit `https://<service-name>.onrender.com/api/health` — it should return:
     ```json
     {
       "status": "ok",
       "service": "care-kind-api",
       "database": "connected",
       "ai": "configured"
     }
     ```
   - **Frontend**: The homepage and navigation should render smoothly.
   - **AI Symptom Checker**: Test a chat prompt to verify Gemini connectivity.
   - **Authentication**: Test registering and logging into an account.
