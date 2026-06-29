# MAGIPONS Workbook Platform - Project Documentation

## Overview

This is a React + TypeScript + Firebase web application for the MAGIPONS workbook platform. Users can log in with Google, complete a 3-day workbook, and have their data persisted in Firestore.

**Deployed**: https://magipons-workbook.netlify.app (once configured)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Firestore
- **Authentication**: Firebase Auth (Google provider)
- **Styling**: Tailwind CSS
- **Hosting**: Netlify
- **Backend**: Netlify Functions (future)

## Project Structure

```
magipons-workbook/
├── src/
│   ├── pages/              # Main pages
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── WorkbookPage.tsx
│   │   └── DashboardPage.tsx
│   ├── components/         # Reusable components
│   │   ├── ProtectedRoute.tsx
│   │   ├── GoogleSignInButton.tsx
│   │   ├── FormField.tsx
│   │   ├── ProgressBar.tsx
│   │   └── AdminTable.tsx (future)
│   ├── services/          # Firebase services
│   │   ├── firebaseConfig.ts
│   │   ├── authService.ts
│   │   ├── firestoreService.ts
│   │   └── types.ts
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useWorkbook.ts
│   ├── utils/             # Utilities
│   │   └── debounce.ts
│   ├── App.tsx            # Routes
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env.local             # Local Firebase config (not committed)
├── .env.local.example     # Template for .env.local
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── SETUP.md              # Setup instructions
└── README.md             # Project overview
```

## Key Features

### Implemented (Phase 1)
✅ Google Authentication
✅ Workbook form with 3 days (Visión, Las Bases, Estrategia de Venta)
✅ Auto-save to Firestore (debounced, 1 second delay)
✅ Progress bar
✅ User dashboard to view submitted workbook
✅ Protected routes (authentication required)

### In Progress (Phase 2)
- [ ] Admin panel to view all workbooks
- [ ] Export workbooks to CSV/Excel
- [ ] Admin role management

### Future (Phase 3)
- [ ] AI-powered workbook review using Claude API
- [ ] Email notifications
- [ ] Workbook templates
- [ ] Analytics dashboard

## Data Structure

### Firestore Collections

#### `users/{uid}`
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "timestamp",
  "lastUpdated": "timestamp"
}
```

#### `workbooks/{docId}`
```json
{
  "userId": "firebase-uid",
  "userEmail": "user@example.com",
  "userName": "User Name",
  "status": "in_progress" | "submitted",
  "data": {
    "day0": { "motivation": "...", "mrh": "50000", "idealDay": "..." },
    "day1": { ... },
    "day2": { ... }
  },
  "createdAt": "timestamp",
  "submittedAt": "timestamp",
  "completionPercentage": 0-100
}
```

#### `admins/{email}`
Used for role-based access. Admin users are listed here.

## Development Workflow

### Local Setup
```bash
npm install
npm run dev          # Start dev server at localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Environment Variables
Copy `.env.local.example` to `.env.local` and fill in Firebase config values.

### Making Changes
1. Edit files in `src/`
2. Hot reload works automatically
3. Test in browser
4. Firestore data persists automatically

## Firebase Configuration

### For Local Development
Use Firestore in **"Test Mode"** (allows all reads/writes without authentication).

### For Production
Switch to **"Production Mode"** and configure proper security rules (see SETUP.md).

### Security Rules (Production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    match /workbooks/{docId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow read: if isAdmin(request.auth.token.email);
      allow list: if isAdmin(request.auth.token.email);
    }
    
    match /admins/{email} {
      allow read: if request.auth != null;
    }
  }
  
  function isAdmin(email) {
    return exists(/databases/$(database)/documents/admins/$(email));
  }
}
```

## Common Tasks

### Add a New Form Field
1. Update `types.ts` to include the new field in `WorkbookData`
2. Add `<FormField>` component in the appropriate day section in `WorkbookPage.tsx`
3. Update `handleFieldChange` call with the new field path

### Change Auto-Save Delay
Edit `WorkbookPage.tsx`, change `1000` in `debounce()` call (milliseconds).

### Add Admin User
1. Go to Firestore Console
2. Create document in `admins` collection with email as ID
3. User with that email can now access admin features

### Deploy Changes
```bash
git add .
git commit -m "Description of changes"
git push origin main
```
Netlify auto-deploys on push.

## Debugging

### Check Firestore Data
1. Go to Firebase Console → Firestore Database
2. Look at `workbooks` collection to see user submissions
3. Check `users` collection to see registered users

### Check Firebase Authentication
1. Go to Firebase Console → Authentication
2. See all logged-in users and their login methods

### Browser Console Errors
Open DevTools (F12) → Console tab to see any JavaScript errors.

## Performance Notes

- Firebase bundle size is large (~600KB), consider code splitting if needed
- Auto-save is debounced to 1 second to avoid excessive writes
- Tailwind CSS is minified and only includes used classes

## Known Issues

None currently. Report bugs in GitHub issues.

## Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev)

## Admin Users (for Phase 2)
- `marita@funnelcracks.com`
- `gonzalo@funnelcracks.com`

These users should be added to the `admins` collection in Firestore to enable admin features.
