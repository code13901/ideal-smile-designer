# 🚀 Free Deployment Guide

## Option 1: Render (Recommended)

### Step 1: Prepare Your Code
1. Create a GitHub repository and push your code
2. Make sure your `package.json` has the correct start script

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: ideal-smile-designer
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables
In Render dashboard, add:
- `GEMINI_API_KEY` = `AIzaSyAFJrDpvipCA3R7v1F5ypoRB5MKiEKKkvM`
- `NODE_ENV` = `production`

✅ **Your app will be live at**: `https://ideal-smile-designer.onrender.com`

---

## Option 2: Railway

### Step 1: Deploy
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Connect your repository
4. Railway auto-detects Node.js and deploys

### Step 2: Environment Variables
Add in Railway dashboard:
- `GEMINI_API_KEY` = `AIzaSyAFJrDpvipCA3R7v1F5ypoRB5MKiEKKkvM`

✅ **Free $5/month credit**

---

## Option 3: Vercel (Serverless)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
vercel --prod
```

### Step 3: Set Environment Variables
```bash
vercel env add GEMINI_API_KEY
```

⚠️ **Note**: May need serverless function adjustments for file uploads

---

## Quick GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit - Ideal Smile Designer for Nano Banana Hackathon"
git branch -M main
git remote add origin https://github.com/yourusername/ideal-smile-designer.git
git push -u origin main
```

## 🏆 For Hackathon Submission

Once deployed, use your live URL in the Kaggle submission:
- **Live Demo**: `https://your-app.onrender.com`
- **GitHub**: `https://github.com/yourusername/ideal-smile-designer`

## 💡 Pro Tips

1. **Render**: Best for Node.js apps with file uploads
2. **Railway**: Simple deployment, good performance
3. **Vercel**: Great for static + serverless, may need modifications

Choose Render for the easiest deployment of your current setup!
