# 🚀 KavachPay Deployment Guide

This guide will walk you through deploying your **Complete KavachPay Project** (Frontend + Backend + Mock API) using **GitHub-connected Auto-Deployment**.

## 🏗️ Architecture Overview
*   **Frontend**: React ([Vercel](https://vercel.com))
*   **Main Backend**: Flask ([Render](https://render.com))
*   **Mock Platform API**: Flask ([Render](https://render.com))
*   **Database**: Firestore (Already Cloud-based)

---

## 1. Prepare Backend for Deployment
Render (and other PaaS) requires specific files and configurations to run Python apps correctly.

### A. Requirements File
I have already generated `backend/requirements.txt` for you. Make sure to commit and push this to GitHub.
```bash
git add backend/requirements.txt
git commit -m "Add requirements for deployment"
git push origin main
```

### B. Environment Variables & Gunicorn
Open `backend/app.py` and ensure it handles the `PORT` provided by Render. 
> [!NOTE]
> I recommend using `gunicorn` on Render. The start command will be `gunicorn app:create_app()`.

---

## 2. Deploy to Render (Backend & Mock API)

Go to [dashboard.render.com](https://dashboard.render.com) and follow these steps **twice** (once for Main Backend, once for Mock API):

### Step 2.1: Main Backend
1.  **New** → **Web Service** → Connect your GitHub Repo.
2.  **Name**: `kavachpay-backend`
3.  **Root Directory**: `backend`
4.  **Runtime**: `Python 3`
5.  **Build Command**: `pip install -r requirements.txt`
6.  **Start Command**: `gunicorn app:create_app()`
7.  **Advanced → Environment Variables**:
    *   `FIREBASE_SERVICE_ACCOUNT_JSON`: Copy the contents of your `firebase-credentials.json` here (or upload the file via Secret Files in Render).
    *   Add any other vars from your `.env` file.

### Step 2.2: Mock Platform API
Repeat the steps above with these changes:
1.  **Name**: `kavachpay-mock-api`
2.  **Root Directory**: `backend`
3.  **Start Command**: `gunicorn mock_platform_api:app` (Make sure your `mock_platform_api` file has an `app` object).

---

## 3. Deploy to Vercel (Frontend)

Go to [vercel.com](https://vercel.com):
1.  **Add New Project** → Connect GitHub Repo.
2.  **Project Name**: `kavachpay-frontend`
3.  **Root Directory**: `frontend`
4.  **Framework Preset**: `Create React App`
5.  **Environment Variables**:
    *   `REACT_APP_API_URL`: **Very Important!** Set this to the URL of your Render **Main Backend** (e.g., `https://kavachpay-backend.onrender.com`).
    *   Copy all other keys from your `frontend/.env`.
6.  **Deploy**.

---

## 4. Final Wiring (Loopback)

### Update Backend Configuration
Since your frontend now lives on a production URL, you must update the **CORS** settings in `app.py` if you haven't already.

### Update Mock Platform API URL
In your Render **Main Backend** Environment Variables, set `PLATFORM_API_URL` to your Render **Mock API** URL.

---

## ⚡ GitHub Sync
Once these are set up, your project is now **Live**!
*   Anytime you **git push** to `main`, Vercel and Render will automatically pick up the changes, build them, and redeploy.
*   Check the "Deployments" tab on Vercel or "Events" tab on Render to monitor the progress.

> [!TIP]
> If you run into build errors on Render, check if you need to specify a Python version (e.g., `3.11`) in a `runtime.txt` file in the `backend` folder.
