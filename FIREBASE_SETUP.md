# Firebase Setup Instructions

## What You Need To Do

I've implemented Firebase real-time synchronization for the scoreboard! Now everyone who visits the site can see the same scores in real-time. Here's what you need to do to complete the setup:

## Step 1: Create a Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Boys-Scoreboard")
4. Disable Google Analytics (optional, not needed for this project)
5. Click **"Create project"**

## Step 2: Set Up Realtime Database (2 minutes)

1. In your Firebase project, click **"Build"** in the left sidebar
2. Click **"Realtime Database"**
3. Click **"Create Database"**
4. Choose a location (e.g., "europe-west1" for Europe)
5. Start in **"Test mode"** (we'll secure it later)
6. Click **"Enable"**

## Step 3: Get Your Firebase Configuration (3 minutes)

1. In Firebase Console, click the ⚙️ gear icon next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Scoreboard Web")
6. Copy the `firebaseConfig` object that appears
7. Click **"Continue to console"**

## Step 4: Add Your Config to the Project (1 minute)

1. Open `scoreboard/src/firebase/config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // Replace this
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Replace this
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",  // Replace this
  projectId: "YOUR_PROJECT_ID",        // Replace this
  storageBucket: "YOUR_PROJECT_ID.appspot.com",    // Replace this
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",   // Replace this
  appId: "YOUR_APP_ID"                 // Replace this
}
```

## Step 5: Secure Your Database (IMPORTANT!)

By default, your database is in test mode, which means anyone can read/write. Let's secure it:

1. Go back to **Realtime Database** in Firebase Console
2. Click the **"Rules"** tab
3. Replace the rules with:

```json
{
  "rules": {
    "games": {
      ".read": true,
      "$gameId": {
        ".write": true
      }
    }
  }
}
```

4. Click **"Publish"**

This allows listing all games (needed for the public games refresh) and writing individual games.

## Step 6: Test Locally (1 minute)

```bash
cd scoreboard
npm run dev
```

Open your browser to test:
1. Click "Create New Game" - you should see a Game ID
2. Open another browser window (or incognito)
3. Enter the same Game ID to join
4. Change scores in one window - they should update instantly in the other! ✨

## Step 7: Deploy to GitHub Pages

```bash
npm run deploy
```

Your site will be live at: `https://niekgroeneveld.github.io/PubquizScoreBoard/`

## How It Works

### Creating a Game
- Click **"+ Create New Game"** 
- A unique Game ID is generated (e.g., `-O1Abc123xyz`)
- Share this ID with others to let them join

### Joining a Game
- Get the Game ID from whoever created the game
- Enter it and click **"Join Game"**
- You'll see the same scoreboard in real-time!

### Game Features
- **Real-time sync**: All changes appear instantly for everyone
- **Player management**: Check/uncheck players to show who's participating
- **Game persistence**: Games stay in Firebase until manually deleted
- **Connection indicator**: Green dot = connected, gray = disconnected

## Troubleshooting

### "CONNECTION ERROR" message
- Check if Firebase config is correct in `src/firebase/config.js`
- Verify Realtime Database is enabled in Firebase Console
- Check browser console for detailed error messages

### "Game not found" when joining
- Double-check the Game ID
- Make sure the game was actually created (check Firebase Console > Realtime Database)

### Scores not syncing
- Check connection indicator (should be green)
- Refresh the page
- Check Firebase Console to see if data is actually in the database

## Firebase Free Tier Limits

Don't worry about costs! The free tier is very generous:
- **Storage**: 1 GB
- **Downloads**: 10 GB/month
- **Simultaneous connections**: 100

Your pub quiz scoreboard will easily fit within these limits! 🎉

## Need Help?

Check the Firebase Console under:
- **Realtime Database > Data tab** - to see your actual data
- **Realtime Database > Usage tab** - to monitor your usage
