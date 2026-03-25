# Dynamic QR Manager (React + GitHub Pages + Firebase Firestore)

This project gives you a complete static web app for **dynamic QR codes** using:

- **React** frontend
- **GitHub Pages** for hosting
- **Firebase Authentication** for admin login
- **Cloud Firestore** for QR code records

The QR links use **hash routing** so they work on GitHub Pages:

```text
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/#/r/spring-campaign
```

That URL opens the React app, reads the QR record from Firestore, and redirects to the current destination.

## Features

- Google sign-in for admin access
- Create, edit, pause, and delete QR codes
- Download QR codes as PNG
- Change destinations without reprinting the QR image
- Firestore-backed persistence
- GitHub Pages deployment using `gh-pages`

## 1. Create the Firebase project

In Firebase console:

1. Create a project.
2. Add a **Web app**.
3. Enable **Authentication** → **Google** provider.
4. Enable **Cloud Firestore** in production or test mode.
5. Copy your Firebase web config.

## 2. Configure the app locally

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` with your Firebase config values.

## 3. Update `package.json`

Replace the `homepage` value with your real GitHub Pages URL:

```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME"
```

This follows the `react-gh-pages` deployment pattern for React apps published to GitHub Pages. citeturn147683view0

## 4. Start locally

```bash
npm start
```

## 5. Firestore data model

Collection:

```text
qrCodes
```

Document shape:

```json
{
  "name": "Spring Campaign",
  "slug": "spring-campaign",
  "targetUrl": "https://example.com/landing",
  "description": "Optional notes",
  "active": true,
  "ownerUid": "firebase-user-id",
  "ownerEmail": "owner@example.com",
  "scanCount": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 6. Recommended Firestore rules

These rules let signed-in users manage only their own QR codes, and let public visitors resolve a QR code and increment only `scanCount`.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /qrCodes/{docId} {
      allow read: if true;

      allow create: if request.auth != null
        && request.resource.data.ownerUid == request.auth.uid;

      allow update, delete: if request.auth != null
        && resource.data.ownerUid == request.auth.uid;

      allow update: if request.auth == null
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['scanCount', 'updatedAt'])
        && request.resource.data.scanCount == resource.data.scanCount + 1;
    }
  }
}
```

### Important note about analytics

Because GitHub Pages is static and there is no trusted server in this architecture, **scan counts are not tamper-proof**. A visitor could refresh or script repeated opens. If you need stronger analytics, move scan logging to **Firebase Cloud Functions** or another backend.

## 7. Add your GitHub Pages domain to Firebase Auth

After you know your Pages URL, add the domain in Firebase Authentication → Settings → Authorized domains.

Example:

```text
YOUR_GITHUB_USERNAME.github.io
```

## 8. Deploy to GitHub Pages

Create a GitHub repo, then:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
npm run deploy
```

The `gh-pages` package publishes the build output to the `gh-pages` branch, which is the approach documented in the `react-gh-pages` guide. citeturn147683view0

## 9. GitHub Pages settings

In your repository:

- Open **Settings** → **Pages**
- Set source to **Deploy from a branch**
- Select branch **gh-pages** and folder **/ (root)**

GitHub Pages is a static hosting service, so this project uses a browser-based Firebase client instead of a traditional server runtime. citeturn147683view0

## 10. How QR redirects work

Each QR code encodes a URL like:

```text
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/#/r/spring-campaign
```

When scanned:

1. GitHub Pages serves your React app.
2. React reads the `slug` from the URL hash.
3. The app fetches the matching Firestore document.
4. The app redirects the browser to the current `targetUrl`.

## Production improvements you can add later

- Firebase Cloud Functions for server-side redirects and safer analytics
- Custom domain
- Better role management
- Bulk QR import/export
- Branded landing pages before redirect

## Stack choice

GitHub Pages supports static sites, and the `react-gh-pages` pattern uses a `homepage` field plus `gh-pages` deployment scripts for React applications. citeturn147683view0
