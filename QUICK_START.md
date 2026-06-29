# MAGIPONS Workbook - Quick Start Guide

⚡ **Get from zero to working app in 20 minutes**

## Step-by-Step (Copy-Paste Ready)

### 1. Create Firebase Project (5 min)
- Go to: https://console.firebase.google.com/
- Click "Crear proyecto" → Name: `magipons-workbook` → Create
- Wait for setup to complete

### 2. Setup Firestore (3 min)
- Left menu → "Firestore Database"
- "Crear base de datos" → Select region (closest to you)
- **Modo de prueba** (allow all for testing)
- Create

### 3. Enable Google Sign-In (2 min)
- Left menu → "Authentication"
- "Sign-in method" tab
- Click Google → Enable → Save
- (Select your email as support email)

### 4. Get Firebase Config (2 min)
- Settings (⚙️) → "Configuración del proyecto"
- Scroll down → Copy `firebaseConfig` object
- You'll see something like:
  ```javascript
  apiKey: "AIza...",
  authDomain: "magipons-workbook.firebaseapp.com",
  projectId: "magipons-workbook",
  ...
  ```

### 5. Create .env.local (2 min)
In the `magipons-workbook` folder:

```bash
# Windows PowerShell or Mac/Linux Terminal
cd "C:\Users\gonza\Desktop\claude code\magipons-workbook"

# Create .env.local file with your Firebase config
cat > .env.local << 'EOF'
VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=magipons-workbook.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=magipons-workbook
VITE_FIREBASE_STORAGE_BUCKET=magipons-workbook.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
EOF
```

### 6. Run Local App (2 min)
```bash
npm run dev
```

Open: http://localhost:5173

### 7. Test It! (2 min)
1. Click "Comienza tu Workbook"
2. Click "Inicia sesión con Google"
3. Select your Google account
4. Fill out Day 0 (just type something)
5. ✅ Data auto-saves to Firestore in 1 second!

### 8. View Data in Firestore (1 min)
- Go to: https://console.firebase.google.com/
- Firestore Database
- Click on `workbooks` collection
- See your data! 🎉

## ✅ You're Done with Phase 1!

The app is fully functional locally.

## 📤 Deploy to Netlify (10 more minutes)

### Setup
1. Go to: https://github.com (create account if needed)
2. Create repo: `magipons-workbook`
3. In your `magipons-workbook` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/magipons-workbook.git
   git push -u origin main
   ```

### Deploy
1. Go to: https://app.netlify.com/ (sign in with GitHub)
2. "Import from Git"
3. Select your `magipons-workbook` repo
4. Settings:
   - Build command: `npm run build`
   - Publish dir: `dist`
5. Click "Deploy"
6. Add environment variables in Netlify:
   - Settings → Variables → Add all your `.env.local` variables
7. Netlify redeploys automatically
8. Your live URL: `https://magipons-workbook.netlify.app`

## 🎯 Done!

Your app is now:
- ✅ Running locally
- ✅ Data persisting to Firestore
- ✅ Deployed globally
- ✅ Auto-deploying on git push

## 🚀 Next Phase

Ready for Phase 2 (Admin Panel + Export)? Let me know!

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| "Module not found" | Run `npm install` |
| "apiKey is invalid" | Copy Firebase config exactly, check VITE_ prefix |
| Blank page on localhost | Check browser console (F12), look for errors |
| Data not saving | Check Firestore is in "Test Mode" |
| Google login fails | Check OAuth is enabled in Firebase Auth |

---

**Questions?** Check `SETUP.md` for detailed explanations!
